'use client';

import { useEffect, useMemo, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import { addSuffix, formatBytes, formatDelta, replaceExtension, toKb } from '@/lib/format';
import { FORMAT_EXTENSION, FORMAT_LABEL } from '@/lib/image/encode';
import type { OutputFormat, ProcessRequest, TargetFormat } from '@/lib/image/types';
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

type Mode = 'quality' | 'target';

export function CompressorTool() {
  const { image, loading, error: loadError, load, clear } = useSingleImage();
  const { result, busy, error: runError, run, reset } = useProcessor();
  const support = useEncoderSupport();

  const [mode, setMode] = useState<Mode>('quality');
  const [quality, setQuality] = useState(75);
  const [targetKb, setTargetKb] = useState<number | null>(200);
  const [allowDownscale, setAllowDownscale] = useState(true);
  const [format, setFormat] = useState<TargetFormat>('source');
  const [engine, setEngine] = useState('');

  useEffect(() => {
    setEngine(isUsingWorker() ? 'background thread' : 'main thread');
  }, []);

  useEffect(() => {
    if (!image) {
      reset();
      return;
    }
    // Start the target field somewhere sensible for this particular file.
    setTargetKb(Math.max(20, Math.round(toKb(image.facts.bytes) / 2)));
  }, [image, reset]);

  const request = useMemo<ProcessRequest | null>(() => {
    if (!image) return null;
    return {
      file: image.file,
      name: image.file.name,
      format,
      quality: quality / 100,
      resize: { mode: 'none' },
      targetBytes: mode === 'target' && targetKb ? targetKb * 1024 : undefined,
      allowDownscale: mode === 'target' ? allowDownscale : false,
    };
  }, [image, format, quality, mode, targetKb, allowDownscale]);

  useDebounced(
    () => {
      void run(request);
    },
    200,
    [request],
  );

  const resultUrl = useObjectUrl(result?.blob ?? null);
  const outputFormat = (result?.type as OutputFormat | undefined) ?? undefined;
  const extension = outputFormat ? FORMAT_EXTENSION[outputFormat] : 'img';
  const filename = image ? addSuffix(replaceExtension(image.file.name, extension), '-compressed') : '';

  const delta = result ? formatDelta(result.sourceBytes, result.bytes) : null;
  const grew = Boolean(result && result.bytes >= result.sourceBytes);

  const readouts = image
    ? [
        { label: 'Original', value: formatBytes(image.facts.bytes) },
        {
          label: 'Compressed',
          value: result ? formatBytes(result.bytes) : busy ? 'working…' : '—',
          tone: result ? (grew ? ('warn' as const) : ('good' as const)) : ('default' as const),
        },
        {
          label: 'Change',
          value: delta ?? '—',
          tone: result ? (grew ? ('warn' as const) : ('good' as const)) : ('default' as const),
        },
        {
          label: 'Quality used',
          value:
            result?.quality !== undefined ? String(Math.round(result.quality * 100)) : 'lossless',
        },
      ]
    : [];

  return (
    <WorkspacePanel
      label="Image compressor"
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
            note={`${outputFormat ? FORMAT_LABEL[outputFormat] : ''} · ${result.width}×${result.height}`}
            onDownload={() => downloadBlob(result.blob, filename)}
          />
        ) : undefined
      }
    >
      {!image ? (
        <div className="space-y-4">
          <DropZone
            onFiles={(files) => void load(files)}
            label="Drop an image to compress"
            disabled={loading}
          />
          {loadError ? <ErrorNotice message={loadError} /> : null}
        </div>
      ) : (
        <div className="space-y-5">
          <ReadoutStrip
            items={readouts}
            live
            caption={engine ? `Compressed in this browser · ${engine}` : undefined}
          />

          {runError ? <ErrorNotice message={runError} /> : null}

          <WorkspaceSplit
            controls={
              <>
                <ControlGroup title="Compress by">
                  <SegmentedControl<Mode>
                    legend="Compression mode"
                    hideLegend
                    value={mode}
                    onChange={setMode}
                    options={[
                      { value: 'quality', label: 'Quality', hint: 'You pick the quality; the file size falls where it falls.' },
                      { value: 'target', label: 'Target size', hint: 'You name a size in KB; the encoder searches for the best quality that fits.' },
                    ]}
                  />
                </ControlGroup>

                {mode === 'quality' ? (
                  <QualitySlider value={quality} onChange={setQuality} />
                ) : (
                  <div className="space-y-3">
                    <NumberField
                      label="Target file size"
                      value={targetKb}
                      onChange={setTargetKb}
                      min={5}
                      max={20000}
                      suffix="KB"
                      hint="The result lands at or under this figure whenever the format allows it."
                    />
                    <Toggle
                      label="Reduce dimensions if needed"
                      checked={allowDownscale}
                      onChange={setAllowDownscale}
                      hint="When quality alone cannot reach the target, shrink the image in steps as well."
                    />
                  </div>
                )}

                <ControlGroup title="Output">
                  <FormatPicker
                    value={format}
                    onChange={setFormat}
                    support={support}
                    sourceLabel="Keep"
                    hint="WebP and AVIF usually reach a given size at higher visual quality than JPG."
                  />
                </ControlGroup>

                <DropZone
                  compact
                  onFiles={(files) => void load(files)}
                  label="Use a different image"
                  hint="Replaces the image above."
                />
              </>
            }
            preview={
              <div className="space-y-3">
                <BeforeAfter
                  alt={image.file.name}
                  beforeSrc={image.url}
                  afterSrc={resultUrl}
                  beforeMeta={formatBytes(image.facts.bytes)}
                  afterMeta={result ? formatBytes(result.bytes) : undefined}
                />

                {result?.targetMet === false ? (
                  <CautionNotice
                    message={`Even at the lowest usable quality this image encodes to ${formatBytes(
                      result.bytes,
                    )}, which is above your target. Allow smaller dimensions, raise the target, or try WebP.`}
                  />
                ) : null}

                {result?.downscaled ? (
                  <CautionNotice
                    message={`Quality alone could not reach the target, so the image was reduced to ${result.width}×${result.height}.`}
                  />
                ) : null}

                {grew && result?.targetMet !== false ? (
                  <CautionNotice message="The result is not smaller than the original. That usually means the source was already compressed harder than these settings — try a lower quality, or keep the original file." />
                ) : null}
              </div>
            }
          />
        </div>
      )}
    </WorkspacePanel>
  );
}
