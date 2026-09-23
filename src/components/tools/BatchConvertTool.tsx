'use client';

import { useCallback, useMemo, useState } from 'react';
import { addSuffix, formatBytes, formatDelta, replaceExtension } from '@/lib/format';
import { FORMAT_EXTENSION, FORMAT_LABEL, isLossy } from '@/lib/image/encode';
import type { OutputFormat, ProcessRequest, TargetFormat } from '@/lib/image/types';
import { BatchWorkspace } from './BatchWorkspace';
import { CautionNotice } from './ErrorNotice';
import { ColorField, Toggle } from './Fields';
import { FormatPicker, useEncoderSupport } from './FormatPicker';
import { QualitySlider } from './QualitySlider';
import { ControlGroup } from './WorkspacePanel';
import { useBatchQueue } from './useBatchQueue';

export function BatchConvertTool() {
  const queue = useBatchQueue();
  const support = useEncoderSupport();

  const [format, setFormat] = useState<TargetFormat>('image/webp');
  const [quality, setQuality] = useState(85);
  const [background, setBackground] = useState('#ffffff');
  const [lossless, setLossless] = useState(false);

  // The picker is rendered without the 'source' option, so the value is always
  // a real output format; this keeps the narrowing explicit rather than cast.
  const target: OutputFormat = format === 'source' ? 'image/webp' : format;
  const targetLabel = FORMAT_LABEL[target];
  const lossy = isLossy(target) && !(target === 'image/webp' && lossless);

  const start = useCallback(() => {
    void queue.run({
      request: (file): ProcessRequest => ({
        file,
        name: file.name,
        format: target,
        quality: quality / 100,
        resize: { mode: 'none' },
        background: target === 'image/jpeg' ? background : undefined,
        lossless: target === 'image/webp' ? lossless : undefined,
      }),
      name: (file) => {
        const renamed = replaceExtension(file.name, FORMAT_EXTENSION[target]);
        // Converting a file into the format it already is would otherwise
        // produce a download with the original's exact name.
        return file.type === target ? addSuffix(renamed, '-converted') : renamed;
      },
      note: (result) =>
        result.bytes > result.sourceBytes
          ? `Larger than the original (${formatBytes(result.sourceBytes)} → ${formatBytes(
              result.bytes,
            )}).`
          : undefined,
    });
  }, [queue, target, quality, background, lossless]);

  const { stats, items } = queue;

  const alreadyTarget = useMemo(
    () => items.filter((item) => item.file.type === target).length,
    [items, target],
  );
  const grown = useMemo(
    () =>
      items.filter(
        (item) =>
          item.status === 'done' &&
          item.outputBytes !== undefined &&
          item.outputBytes > item.sourceBytes,
      ).length,
    [items],
  );

  const totalDelta = stats.done > 0 ? formatDelta(stats.sourceBytes, stats.outputBytes) : null;

  const readouts = [
    { label: 'Files', value: `${stats.total}` },
    { label: 'Writing', value: targetLabel },
    { label: 'Total before', value: stats.sourceBytes > 0 ? formatBytes(stats.sourceBytes) : '—' },
    {
      label: 'Total after',
      value: stats.outputBytes > 0 ? `${formatBytes(stats.outputBytes)}` : '—',
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
      label="Batch image converter"
      dropLabel="Drop images to convert together"
      dropHint="Mixed formats are fine — every file is written out as the format you pick. Nothing is uploaded."
      runLabel={`Convert ${stats.total} ${stats.total === 1 ? 'image' : 'images'}`}
      zipName={`pixeleditor-${FORMAT_EXTENSION[target]}.zip`}
      onRun={start}
      queue={queue}
      readouts={readouts}
      controls={
        <>
          <ControlGroup title="Convert everything to">
            <FormatPicker
              value={format}
              onChange={setFormat}
              support={support}
              includeSource={false}
              legend="Output format"
              hint="Only formats this browser proved it can write are listed here."
            />
          </ControlGroup>

          {lossy ? (
            <QualitySlider
              value={quality}
              onChange={setQuality}
              hint={`One quality setting for the whole batch. 80–90 keeps ${targetLabel} looking close to the original for photographs.`}
            />
          ) : (
            <p className="text-xs text-ink-muted">
              {target === 'image/png'
                ? 'PNG is lossless, so there is no quality setting. Photographs will grow.'
                : 'Lossless WebP keeps every pixel, so there is no quality setting.'}
            </p>
          )}

          {target === 'image/webp' ? (
            <Toggle
              label="Lossless WebP"
              checked={lossless}
              onChange={setLossless}
              hint="Good for screenshots and flat graphics; usually much larger for photographs."
            />
          ) : null}

          {target === 'image/jpeg' ? (
            <ControlGroup
              title="Background"
              hint="JPG has no transparency. Transparent areas in PNG or WebP sources are filled with this colour."
            >
              <ColorField label="Fill colour" value={background} onChange={setBackground} />
            </ControlGroup>
          ) : null}
        </>
      }
      notes={
        <>
          {alreadyTarget > 0 ? (
            <CautionNotice
              message={`${alreadyTarget} ${
                alreadyTarget === 1 ? 'file is' : 'files are'
              } already ${targetLabel}. Re-encoding cannot improve them, so those downloads carry a “-converted” suffix to keep them apart from your originals.`}
            />
          ) : null}
          {target === 'image/jpeg' ? (
            <CautionNotice message="Any transparency in the batch is flattened onto the background colour, because JPG cannot store an alpha channel." />
          ) : null}
          {grown > 0 ? (
            <CautionNotice
              message={`${grown} ${
                grown === 1 ? 'file came' : 'files came'
              } out larger than the original — normal when a compressed photograph is written to a lossless format.`}
            />
          ) : null}
        </>
      }
    />
  );
}
