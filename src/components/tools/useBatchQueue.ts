'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import { uniqueName } from '@/lib/format';
import type { ProcessRequest, ProcessResult } from '@/lib/image/types';
import { buildZip } from '@/lib/image/zip';
import { processImage } from '@/lib/workers/client';
import type { BatchRow } from './BatchTable';
import { describeError } from './useImageTool';

/**
 * A browser tab has a finite amount of memory, and every decoded image needs
 * width × height × 4 bytes of it. The cap is a real limit of the approach, so
 * it is stated plainly rather than hidden behind an optimistic "unlimited".
 */
export const MAX_BATCH_FILES = 50;

export interface BatchItem {
  id: string;
  file: File;
  status: BatchRow['status'];
  sourceBytes: number;
  outputBytes?: number;
  dimensions?: string;
  message?: string;
  blob?: Blob;
  outputName?: string;
}

export interface BatchPlan {
  /** Builds the processing request for one file. */
  request: (file: File) => ProcessRequest;
  /** Names the finished file. Collisions are resolved automatically. */
  name: (file: File, result: ProcessResult) => string;
  /**
   * Optional per-file remark, shown under the filename. Meant for honest
   * shortfalls — a target size that could not be reached, say — not for
   * decoration.
   */
  note?: (result: ProcessResult) => string | undefined;
}

export function useBatchQueue() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [running, setRunning] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The worker loop needs the live list without re-creating itself on every
  // state change; the same saved-ref pattern the debounce hook uses.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const cancelRef = useRef(false);

  const add = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setItems((current) => {
      const seen = new Set(current.map((item) => item.id));
      const next = [...current];
      let rejected = 0;

      for (const file of files) {
        const id = `${file.name}:${file.size}:${file.lastModified}`;
        if (seen.has(id)) continue;
        if (next.length >= MAX_BATCH_FILES) {
          rejected += 1;
          continue;
        }
        seen.add(id);
        next.push({ id, file, status: 'queued', sourceBytes: file.size });
      }

      if (rejected > 0) {
        setError(
          `This batch is capped at ${MAX_BATCH_FILES} files so the tab does not run out of memory. ${rejected} ${
            rejected === 1 ? 'file was' : 'files were'
          } left out — run a second batch for the rest.`,
        );
      }
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => {
    cancelRef.current = true;
    setItems([]);
    setError(null);
  }, []);

  /** Puts every finished file back in the queue, e.g. after a setting changes. */
  const resetResults = useCallback(() => {
    setItems((current) =>
      current.map((item) => ({
        id: item.id,
        file: item.file,
        status: 'queued' as const,
        sourceBytes: item.sourceBytes,
      })),
    );
  }, []);

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const run = useCallback(async (plan: BatchPlan) => {
    if (itemsRef.current.length === 0) return;
    cancelRef.current = false;
    setError(null);
    setRunning(true);

    const taken = new Set<string>();
    // One file at a time: parallel decoding of large photos is the quickest
    // way to have the browser kill the tab.
    for (const item of itemsRef.current) {
      if (cancelRef.current) {
        setItems((current) =>
          current.map((row) =>
            row.status === 'queued' || row.status === 'working'
              ? { ...row, status: 'skipped', message: 'Stopped before this file ran' }
              : row,
          ),
        );
        break;
      }

      if (item.status === 'done' && item.blob && item.outputName) {
        taken.add(item.outputName);
        continue;
      }

      setItems((current) =>
        current.map((row) =>
          row.id === item.id ? { ...row, status: 'working', message: undefined } : row,
        ),
      );

      try {
        const result = await processImage(plan.request(item.file));
        const outputName = uniqueName(plan.name(item.file, result), taken);
        setItems((current) =>
          current.map((row) =>
            row.id === item.id
              ? {
                  ...row,
                  status: 'done',
                  blob: result.blob,
                  outputName,
                  outputBytes: result.bytes,
                  dimensions: `${result.width}×${result.height}`,
                  message: plan.note?.(result),
                }
              : row,
          ),
        );
      } catch (thrown) {
        setItems((current) =>
          current.map((row) =>
            row.id === item.id
              ? { ...row, status: 'error', message: describeError(thrown) }
              : row,
          ),
        );
      }
    }

    setRunning(false);
  }, []);

  const downloadOne = useCallback((id: string) => {
    const item = itemsRef.current.find((row) => row.id === id);
    if (item?.blob && item.outputName) downloadBlob(item.blob, item.outputName);
  }, []);

  const downloadZip = useCallback(async (archiveName: string) => {
    const entries = itemsRef.current
      .filter((item) => item.status === 'done' && item.blob && item.outputName)
      .map((item) => ({ name: item.outputName as string, blob: item.blob as Blob }));

    if (entries.length === 0) {
      setError('There are no finished files to package yet.');
      return;
    }

    setZipping(true);
    setError(null);
    try {
      const archive = await buildZip(entries);
      downloadBlob(archive, archiveName);
    } catch (thrown) {
      setError(describeError(thrown));
    } finally {
      setZipping(false);
    }
  }, []);

  const stats = useMemo(() => {
    const done = items.filter((item) => item.status === 'done');
    const failed = items.filter((item) => item.status === 'error');
    const pending = items.filter((item) => item.status === 'queued' || item.status === 'working');
    const sourceBytes = done.reduce((sum, item) => sum + item.sourceBytes, 0);
    const outputBytes = done.reduce((sum, item) => sum + (item.outputBytes ?? 0), 0);
    const settled = items.length - pending.length;

    return {
      total: items.length,
      done: done.length,
      failed: failed.length,
      pending: pending.length,
      sourceBytes,
      outputBytes,
      percent: items.length === 0 ? 0 : (settled / items.length) * 100,
    };
  }, [items]);

  const rows: BatchRow[] = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.outputName ?? item.file.name,
        status: item.status,
        sourceBytes: item.sourceBytes,
        outputBytes: item.outputBytes,
        dimensions: item.dimensions,
        message: item.message,
      })),
    [items],
  );

  return {
    items,
    rows,
    stats,
    running,
    zipping,
    error,
    setError,
    add,
    remove,
    clear,
    resetResults,
    cancel,
    run,
    downloadOne,
    downloadZip,
  };
}
