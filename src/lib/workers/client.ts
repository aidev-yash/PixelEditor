'use client';

import { canUseWorker } from '../image/capabilities';
import { runProcess } from '../image/pipeline';
import type { ProcessRequest, ProcessResult } from '../image/types';

/**
 * Talks to the image worker, with an automatic fall back to the main thread.
 *
 * Workers need OffscreenCanvas to draw, and a small number of browsers either
 * lack it or refuse to construct a module worker from a static host. Rather
 * than break for those visitors, the first sign of trouble permanently
 * switches this module to the in-page path, which produces identical output
 * and only costs responsiveness.
 */

interface WorkerResponse {
  id: number;
  ok: boolean;
  result?: ProcessResult;
  message?: string;
}

const FALLBACK = Symbol('fallback');

let worker: Worker | null = null;
let workerUnavailable = false;
let sequence = 0;

const pending = new Map<
  number,
  { resolve: (result: ProcessResult) => void; reject: (error: unknown) => void }
>();

function disableWorker(reason: unknown) {
  workerUnavailable = true;
  for (const entry of pending.values()) entry.reject(reason);
  pending.clear();
  try {
    worker?.terminate();
  } catch {
    /* already gone */
  }
  worker = null;
}

function ensureWorker(): Worker | null {
  if (workerUnavailable || !canUseWorker()) return null;
  if (worker) return worker;

  try {
    const instance = new Worker(new URL('./image.worker.ts', import.meta.url));

    instance.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data;
      const entry = pending.get(data.id);
      if (!entry) return;
      pending.delete(data.id);
      if (data.ok && data.result) {
        entry.resolve(data.result);
      } else {
        entry.reject(new Error(data.message || 'This image could not be processed.'));
      }
    };

    instance.onerror = () => {
      disableWorker(FALLBACK);
    };
    instance.onmessageerror = () => {
      disableWorker(FALLBACK);
    };

    worker = instance;
    return worker;
  } catch {
    workerUnavailable = true;
    return null;
  }
}

function postToWorker(instance: Worker, request: ProcessRequest): Promise<ProcessResult> {
  return new Promise<ProcessResult>((resolve, reject) => {
    sequence += 1;
    const id = sequence;
    pending.set(id, { resolve, reject });
    try {
      instance.postMessage({ id, request });
    } catch {
      pending.delete(id);
      // Structured clone failures mean this browser cannot hand the file over;
      // process it in the page instead.
      disableWorker(FALLBACK);
      reject(FALLBACK);
    }
  });
}

export async function processImage(request: ProcessRequest): Promise<ProcessResult> {
  const instance = ensureWorker();

  if (instance) {
    try {
      return await postToWorker(instance, request);
    } catch (error) {
      // A real processing error (bad file, unsupported encoder) is reported to
      // the caller. Only an infrastructure failure falls through.
      if (error !== FALLBACK) throw error;
    }
  }

  return runProcess(request);
}

/** True when work is currently being handed to a background thread. */
export function isUsingWorker(): boolean {
  return !workerUnavailable && canUseWorker();
}

export function shutdownWorker(): void {
  try {
    worker?.terminate();
  } catch {
    /* nothing to clean up */
  }
  worker = null;
  pending.clear();
}
