'use client';

import { useCallback, useMemo, useState } from 'react';
import { addSuffix, formatBytes, replaceExtension } from '@/lib/format';
import { FORMAT_EXTENSION } from '@/lib/image/encode';
import type { OutputFormat, ProcessRequest, ResizeSpec, TargetFormat } from '@/lib/image/types';
import { BatchWorkspace } from './BatchWorkspace';
import { CautionNotice } from './ErrorNotice';
import { Toggle } from './Fields';
import { FormatPicker, useEncoderSupport } from './FormatPicker';
import { NumberField } from './NumberField';
import { QualitySlider } from './QualitySlider';
import { SegmentedControl } from './SegmentedControl';
import { ControlGroup } from './WorkspacePanel';
import { useBatchQueue } from './useBatchQueue';

type Mode = 'fit' | 'width' | 'percent';

export function BatchResizeTool() {
  const queue = useBatchQueue();
  const support = useEncoderSupport();

  const [mode, setMode] = useState<Mode>('fit');
  const [boxWidth, setBoxWidth] = useState<number | null>(1600);
  const [boxHeight, setBoxHeight] = useState<number | null>(1600);
  const [width, setWidth] = useState<number | null>(1080);
  const [percent, setPercent] = useState<number | null>(50);
  const [noUpscale, setNoUpscale] = useState(true);
  const [format, setFormat] = useState<TargetFormat>('source');
  const [quality, setQuality] = useState(82);

  const resize = useMemo<ResizeSpec>(() => {
    if (mode === 'percent') {
      return { mode: 'percent', percent: percent && percent > 0 ? percent : 100 };
    }
    if (mode === 'width') {
      return { mode: 'exact', width: width ?? undefined };
    }
    return {
      mode: 'fit',
      width: boxWidth ?? undefined,
      height: boxHeight ?? undefined,
      noUpscale,
    };
  }, [mode, percent, width, boxWidth, boxHeight, noUpscale]);

  const incomplete =
    (mode === 'percent' && !percent) ||
    (mode === 'width' && !width) ||
    (mode === 'fit' && !boxWidth && !boxHeight);

  const start = useCallback(() => {
    void queue.run({
      request: (file): ProcessRequest => ({
        file,
        name: file.name,
        format,
        quality: quality / 100,
        resize,
      }),
      name: (file, result) => {
        const extension = FORMAT_EXTENSION[result.type as OutputFormat] ?? 'img';
        return addSuffix(
          replaceExtension(file.name, extension),
          `-${result.width}x${result.height}`,
        );
      },
    });
  }, [queue, format, quality, resize]);

  const { stats } = queue;
  const readouts = [
    { label: 'Files', value: `${stats.total}` },
    { label: 'Finished', value: `${stats.done}`, tone: stats.done > 0 ? ('good' as const) : undefined },
    { label: 'Total before', value: stats.sourceBytes > 0 ? formatBytes(stats.sourceBytes) : '—' },
    {
      label: 'Total after',
      value: stats.outputBytes > 0 ? formatBytes(stats.outputBytes) : '—',
      tone:
        stats.outputBytes > 0 && stats.outputBytes < stats.sourceBytes
          ? ('good' as const)
          : undefined,
    },
  ];

  const pngTarget = format === 'image/png';

  return (
    <BatchWorkspace
      label="Batch image resizer"
      dropLabel="Drop images to resize together"
      dropHint="Every file gets the same settings. Nothing is uploaded — the queue runs in this tab."
      runLabel={`Resize ${stats.total} ${stats.total === 1 ? 'image' : 'images'}`}
      zipName="pixeleditor-resized.zip"
      onRun={start}
      runDisabled={incomplete}
      queue={queue}
      readouts={readouts}
      controls={
        <>
          <ControlGroup title="Resize by">
            <SegmentedControl<Mode>
              legend="Resize mode"
              hideLegend
              value={mode}
              onChange={setMode}
              columns={3}
              options={[
                {
                  value: 'fit',
                  label: 'Fit in box',
                  hint: 'Safest for mixed batches: portraits and landscapes both end up inside the box, ratios kept.',
                },
                {
                  value: 'width',
                  label: 'Set width',
                  hint: 'Every image gets this width; the height follows its own ratio.',
                },
                {
                  value: 'percent',
                  label: 'Percentage',
                  hint: 'Each image is scaled by the same amount, whatever its size.',
                },
              ]}
            />
          </ControlGroup>

          {mode === 'fit' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Max width"
                  value={boxWidth}
                  onChange={setBoxWidth}
                  min={1}
                  max={20000}
                  suffix="px"
                />
                <NumberField
                  label="Max height"
                  value={boxHeight}
                  onChange={setBoxHeight}
                  min={1}
                  max={20000}
                  suffix="px"
                />
              </div>
              <Toggle
                label="Never enlarge"
                checked={noUpscale}
                onChange={setNoUpscale}
                hint="Files already smaller than the box are re-saved at their own size rather than blown up."
              />
            </div>
          ) : mode === 'width' ? (
            <NumberField
              label="Width"
              value={width}
              onChange={setWidth}
              min={1}
              max={20000}
              suffix="px"
              hint="Heights will differ between files, because each keeps its own shape."
            />
          ) : (
            <NumberField
              label="Scale"
              value={percent}
              onChange={setPercent}
              min={1}
              max={400}
              suffix="%"
              hint="50% halves each side, so the pixel count drops to a quarter."
            />
          )}

          <ControlGroup title="Output">
            <FormatPicker
              value={format}
              onChange={setFormat}
              support={support}
              sourceLabel="Keep each"
              hint="“Keep each” writes every file back in the format it arrived in."
            />
          </ControlGroup>

          {format !== 'image/png' ? (
            <QualitySlider
              value={quality}
              onChange={setQuality}
              hint="Applied to every lossy file in the batch. PNG files ignore it — PNG is lossless."
            />
          ) : (
            <p className="text-xs text-ink-muted">
              PNG is lossless, so there is no quality setting. Photographs written as PNG come out
              much larger than JPG or WebP.
            </p>
          )}
        </>
      }
      notes={
        <>
          {mode === 'width' ? (
            <CautionNotice message="A fixed width means tall images end up much taller than wide ones. If you need every file to fit the same frame, use “Fit in box” instead." />
          ) : null}
          {pngTarget ? (
            <CautionNotice message="Every file in this batch will be written as PNG, including photographs. Expect the total to grow rather than shrink." />
          ) : null}
          {incomplete ? (
            <CautionNotice message="Fill in a size before running the batch — there is nothing to resize to yet." />
          ) : null}
        </>
      }
    />
  );
}
