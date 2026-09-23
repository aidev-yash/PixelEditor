'use client';

import { useEffect, useMemo, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import { addSuffix, formatBytes, formatDelta, replaceExtension } from '@/lib/format';
import { FORMAT_EXTENSION, FORMAT_LABEL } from '@/lib/image/encode';
import type { OutputFormat, ProcessRequest, ResizeSpec, TargetFormat } from '@/lib/image/types';
import { isUsingWorker } from '@/lib/workers/client';
import { Button } from './Button';
import { DownloadBar } from './DownloadBar';
import { DropZone } from './DropZone';
import { CautionNotice, ErrorNotice } from './ErrorNotice';
import { Toggle } from './Fields';
import { FormatPicker, useEncoderSupport } from './FormatPicker';
import { BeforeAfter } from './ImagePreview';
import { NumberField } from './NumberField';
import { QualitySlider } from './QualitySlider';
import { ReadoutStrip } from './ReadoutStrip';
import { SegmentedControl } from './SegmentedControl';
import { ControlGroup, LocalBadge, WorkspacePanel, WorkspaceSplit } from './WorkspacePanel';
import { useDebounced, useObjectUrl, useProcessor, useSingleImage } from './useImageTool';

type Mode = 'exact' | 'fit' | 'percent';

const WIDTH_PRESETS = [320, 640, 800, 1080, 1280, 1920];

export function ResizerTool() {
  const { image, loading, error: loadError, load, clear } = useSingleImage();
  const { result, busy, error: runError, run, reset } = useProcessor();
  const support = useEncoderSupport();

  const [mode, setMode] = useState<Mode>('exact');
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [percent, setPercent] = useState<number | null>(50);
  const [lock, setLock] = useState(true);
  const [noUpscale, setNoUpscale] = useState(true);
  const [format, setFormat] = useState<TargetFormat>('source');
  const [quality, setQuality] = useState(82);
  const [engine, setEngine] = useState('');

  useEffect(() => {
    setEngine(isUsingWorker() ? 'background thread' : 'main thread');
  }, []);

  useEffect(() => {
    if (!image) {
      reset();
      return;
    }
    setWidth(image.facts.width);
    setHeight(image.facts.height);
  }, [image, reset]);

  const ratio = image ? image.facts.width / image.facts.height : 1;

  const request = useMemo<ProcessRequest | null>(() => {
    if (!image) return null;
    const resize: ResizeSpec =
      mode === 'percent'
        ? { mode: 'percent', percent: percent && percent > 0 ? percent : 100 }
        : mode === 'fit'
          ? {
              mode: 'fit',
              width: width ?? undefined,
              height: height ?? undefined,
              noUpscale,
            }
          : { mode: 'exact', width: width ?? undefined, height: height ?? undefined };

    return {
      file: image.file,
      name: image.file.name,
      format,
      quality: quality / 100,
      resize,
    };
  }, [image, mode, percent, width, height, noUpscale, format, quality]);

  useDebounced(
    () => {
      void run(request);
    },
    160,
    [request],
  );

  const resultUrl = useObjectUrl(result?.blob ?? null);

  const outputFormat = (result?.type as OutputFormat | undefined) ?? undefined;
  const extension = outputFormat ? FORMAT_EXTENSION[outputFormat] : 'img';
  const filename =
    image && result
      ? addSuffix(replaceExtension(image.file.name, extension), `-${result.width}x${result.height}`)
      : '';

  const delta = result ? formatDelta(result.sourceBytes, result.bytes) : null;
  const enlarged = Boolean(
    result && image && (result.width > image.facts.width || result.height > image.facts.height),
  );

  const readouts = image
    ? [
        { label: 'Source', value: `${image.facts.width}×${image.facts.height}` },
        { label: 'Source size', value: formatBytes(image.facts.bytes) },
        {
          label: 'Result',
          value: result ? `${result.width}×${result.height}` : busy ? 'working…' : '—',
        },
        {
          label: 'Result size',
          value: result ? `${formatBytes(result.bytes)}${delta ? ` (${delta})` : ''}` : '—',
          tone: result && result.bytes < result.sourceBytes ? ('good' as const) : ('default' as const),
        },
      ]
    : [];

  return (
    <WorkspacePanel
      label="Image resizer"
      status={
        <>
          <LocalBadge />
          {image ? (
            <Button variant="ghost" onClick={clear} className="px-2 py-1">
              Start over
            </Button>
          ) : null}
        </>
      }
      footer={
        image && result ? (
          <DownloadBar
            filename={filename}
            bytes={result.bytes}
            busy={busy}
            note={outputFormat ? FORMAT_LABEL[outputFormat] : undefined}
            onDownload={() => downloadBlob(result.blob, filename)}
          />
        ) : undefined
      }
    >
      {!image ? (
        <div className="space-y-4">
          <DropZone
            onFiles={(files) => void load(files)}
            label="Drop an image to resize"
            disabled={loading}
          />
          {loadError ? <ErrorNotice message={loadError} /> : null}
        </div>
      ) : (
        <div className="space-y-5">
          <ReadoutStrip
            items={readouts}
            live
            caption={engine ? `Resized in this browser · ${engine}` : undefined}
          />

          {runError ? <ErrorNotice message={runError} /> : null}

          <WorkspaceSplit
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
                        value: 'exact',
                        label: 'Exact size',
                        hint: 'Both numbers are honoured. Unlock the ratio to stretch the image.',
                      },
                      {
                        value: 'fit',
                        label: 'Fit inside',
                        hint: 'Largest size that fits the box, with the ratio kept.',
                      },
                      {
                        value: 'percent',
                        label: 'Percentage',
                        hint: 'Scales both sides by the same amount.',
                      },
                    ]}
                  />
                </ControlGroup>

                {mode === 'percent' ? (
                  <NumberField
                    label="Scale"
                    value={percent}
                    onChange={setPercent}
                    min={1}
                    max={400}
                    suffix="%"
                    hint={
                      image && percent
                        ? `Result: ${Math.max(1, Math.round((image.facts.width * percent) / 100))}×${Math.max(
                            1,
                            Math.round((image.facts.height * percent) / 100),
                          )}`
                        : undefined
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField
                        label="Width"
                        value={width}
                        onChange={(value) => {
                          setWidth(value);
                          if (lock && value && mode === 'exact') {
                            setHeight(Math.max(1, Math.round(value / ratio)));
                          }
                        }}
                        min={1}
                        max={20000}
                        suffix="px"
                      />
                      <NumberField
                        label="Height"
                        value={height}
                        onChange={(value) => {
                          setHeight(value);
                          if (lock && value && mode === 'exact') {
                            setWidth(Math.max(1, Math.round(value * ratio)));
                          }
                        }}
                        min={1}
                        max={20000}
                        suffix="px"
                      />
                    </div>

                    {mode === 'exact' ? (
                      <Toggle
                        label="Lock aspect ratio"
                        checked={lock}
                        onChange={setLock}
                        hint="On: typing one side updates the other. Off: the image is stretched to fit."
                      />
                    ) : (
                      <Toggle
                        label="Never enlarge"
                        checked={noUpscale}
                        onChange={setNoUpscale}
                        hint="Leaves images that are already smaller than the box untouched."
                      />
                    )}

                    <div>
                      <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
                        Common widths
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {WIDTH_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setWidth(preset);
                              setHeight(Math.max(1, Math.round(preset / ratio)));
                            }}
                            className="border border-rule px-2.5 py-1 font-mono text-xs text-ink transition-colors hover:border-instrument hover:bg-paper"
                          >
                            {preset}px
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <ControlGroup title="Output">
                  <FormatPicker value={format} onChange={setFormat} support={support} />
                </ControlGroup>

                {format !== 'image/png' &&
                !(format === 'source' && image.facts.detectedType === 'image/png') ? (
                  <QualitySlider value={quality} onChange={setQuality} />
                ) : (
                  <p className="text-xs text-ink-muted">
                    PNG is lossless, so there is no quality setting. Size is decided by the
                    dimensions and the number of colours.
                  </p>
                )}

                <DropZone
                  compact
                  onFiles={(files) => void load(files)}
                  label="Use a different image"
                  hint="Replaces the image above. The current one is discarded from memory."
                />
              </>
            }
            preview={
              <div className="space-y-3">
                <BeforeAfter
                  alt={image.file.name}
                  beforeSrc={image.url}
                  afterSrc={resultUrl}
                  beforeMeta={`${image.facts.width}×${image.facts.height} · ${formatBytes(image.facts.bytes)}`}
                  afterMeta={
                    result
                      ? `${result.width}×${result.height} · ${formatBytes(result.bytes)}`
                      : undefined
                  }
                />
                {enlarged ? (
                  <CautionNotice message="You are enlarging this image. Scaling up cannot add detail that was never captured, so the result will look softer than the original." />
                ) : null}
              </div>
            }
          />
        </div>
      )}
    </WorkspacePanel>
  );
}
