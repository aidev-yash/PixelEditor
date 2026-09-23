'use client';

import { useCallback, useMemo, useState } from 'react';
import { addSuffix, formatBytes, formatDelta, replaceExtension } from '@/lib/format';
import { FORMAT_EXTENSION } from '@/lib/image/encode';
import type { OutputFormat, ProcessRequest, TargetFormat } from '@/lib/image/types';
import { BatchWorkspace } from './BatchWorkspace';
import { CautionNotice } from './ErrorNotice';
import { Toggle } from './Fields';
import { FormatPicker, useEncoderSupport } from './FormatPicker';
import { NumberField } from './NumberField';
import { QualitySlider } from './QualitySlider';
import { SegmentedControl } from './SegmentedControl';
import { ControlGroup } from './WorkspacePanel';
import { useBatchQueue } from './useBatchQueue';

type Mode = 'quality' | 'target';

export function BatchCompressTool() {
  const queue = useBatchQueue();
  const support = useEncoderSupport();

  const [mode, setMode] = useState<Mode>('quality');
  const [quality, setQuality] = useState(75);
  const [targetKb, setTargetKb] = useState<number | null>(200);
  const [allowDownscale, setAllowDownscale] = useState(true);
  const [format, setFormat] = useState<TargetFormat>('source');

  const incomplete = mode === 'target' && !targetKb;

  const start = useCallback(() => {
    void queue.run({
      request: (file): ProcessRequest => ({
        file,
        name: file.name,
        format,
        quality: quality / 100,
        resize: { mode: 'none' },
        targetBytes: mode === 'target' && targetKb ? targetKb * 1024 : undefined,
        allowDownscale: mode === 'target' ? allowDownscale : false,
      }),
      name: (file, result) => {
        const extension = FORMAT_EXTENSION[result.type as OutputFormat] ?? 'img';
        return addSuffix(replaceExtension(file.name, extension), '-compressed');
      },
      note: (result) => {
        if (result.targetMet === false) {
          return `Could not reach the target — smallest this file would encode to was ${formatBytes(
            result.bytes,
          )}.`;
        }
        if (result.downscaled) {
          return `Reduced to ${result.width}×${result.height} to fit the target.`;
        }
        if (result.bytes >= result.sourceBytes) {
          return 'Already compressed harder than these settings — the original is smaller.';
        }
        return undefined;
      },
    });
  }, [queue, format, quality, mode, targetKb, allowDownscale]);

  const { stats, items } = queue;

  const missed = useMemo(
    () => items.filter((item) => item.status === 'done' && item.message).length,
    [items],
  );
  const grown = useMemo(
    () =>
      items.filter(
        (item) =>
          item.status === 'done' &&
          item.outputBytes !== undefined &&
          item.outputBytes >= item.sourceBytes,
      ).length,
    [items],
  );

  const totalDelta =
    stats.done > 0 ? formatDelta(stats.sourceBytes, stats.outputBytes) : null;

  const readouts = [
    { label: 'Files', value: `${stats.total}` },
    { label: 'Total before', value: stats.sourceBytes > 0 ? formatBytes(stats.sourceBytes) : '—' },
    {
      label: 'Total after',
      value: stats.outputBytes > 0 ? formatBytes(stats.outputBytes) : '—',
    },
    {
      label: 'Change',
      value: totalDelta ?? '—',
      tone:
        stats.done > 0
          ? stats.outputBytes < stats.sourceBytes
            ? ('good' as const)
            : ('warn' as const)
          : undefined,
    },
  ];

  return (
    <BatchWorkspace
      label="Batch image compressor"
      dropLabel="Drop images to compress together"
      dropHint="One set of settings, applied file by file in this tab. Nothing is uploaded."
      runLabel={`Compress ${stats.total} ${stats.total === 1 ? 'image' : 'images'}`}
      zipName="pixeleditor-compressed.zip"
      onRun={start}
      runDisabled={incomplete}
      queue={queue}
      readouts={readouts}
      controls={
        <>
          <ControlGroup title="Compress by">
            <SegmentedControl<Mode>
              legend="Compression mode"
              hideLegend
              value={mode}
              onChange={setMode}
              options={[
                {
                  value: 'quality',
                  label: 'Quality',
                  hint: 'One quality setting for the whole batch. Sizes will vary between files.',
                },
                {
                  value: 'target',
                  label: 'Target size',
                  hint: 'Each file is searched separately for the best quality that fits your KB figure.',
                },
              ]}
            />
          </ControlGroup>

          {mode === 'quality' ? (
            <QualitySlider
              value={quality}
              onChange={setQuality}
              hint="Applied to every lossy file. 70–80 is the usual range for web photographs."
            />
          ) : (
            <div className="space-y-3">
              <NumberField
                label="Target file size"
                value={targetKb}
                onChange={setTargetKb}
                min={5}
                max={20000}
                suffix="KB"
                hint="Each file is encoded several times to find the quality that lands under this. A batch in target mode takes noticeably longer."
              />
              <Toggle
                label="Reduce dimensions if needed"
                checked={allowDownscale}
                onChange={setAllowDownscale}
                hint="When quality alone cannot reach the target, shrink that file in steps as well."
              />
            </div>
          )}

          <ControlGroup title="Output">
            <FormatPicker
              value={format}
              onChange={setFormat}
              support={support}
              sourceLabel="Keep each"
              hint="WebP usually reaches a given size at higher visual quality than JPG."
            />
          </ControlGroup>
        </>
      }
      notes={
        <>
          {mode === 'target' && stats.pending > 0 ? (
            <CautionNotice message="Target mode encodes each file repeatedly to search for the right quality, so expect this to run slower than quality mode." />
          ) : null}
          {missed > 0 ? (
            <CautionNotice
              message={`${missed} ${
                missed === 1 ? 'file has' : 'files have'
              } a remark under the filename — some could not meet the target, or came out no smaller than the original.`}
            />
          ) : null}
          {grown > 0 && missed === 0 ? (
            <CautionNotice
              message={`${grown} ${
                grown === 1 ? 'file is' : 'files are'
              } no smaller than the original. Those were already compressed harder than these settings; keep the originals for them.`}
            />
          ) : null}
        </>
      }
    />
  );
}
