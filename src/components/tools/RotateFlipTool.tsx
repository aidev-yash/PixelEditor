'use client';

import { useEffect, useMemo, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import { addSuffix, formatBytes, replaceExtension } from '@/lib/format';
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
import { QualitySlider } from './QualitySlider';
import { ReadoutStrip } from './ReadoutStrip';
import { ControlGroup, LocalBadge, WorkspacePanel, WorkspaceSplit } from './WorkspacePanel';
import { useDebounced, useObjectUrl, useProcessor, useSingleImage } from './useImageTool';

type Rotation = 0 | 90 | 180 | 270;

const ROTATION_LABEL: Record<Rotation, string> = {
  0: 'Upright',
  90: 'Quarter turn right',
  180: 'Upside down',
  270: 'Quarter turn left',
};

export function RotateFlipTool() {
  const { image, loading, error: loadError, load, clear } = useSingleImage();
  const { result, busy, error: runError, run, reset } = useProcessor();
  const support = useEncoderSupport();

  const [rotation, setRotation] = useState<Rotation>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [format, setFormat] = useState<TargetFormat>('source');
  const [quality, setQuality] = useState(90);
  const [engine, setEngine] = useState('');

  useEffect(() => {
    setEngine(isUsingWorker() ? 'background thread' : 'main thread');
  }, []);

  useEffect(() => {
    if (!image) {
      reset();
      return;
    }
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, [image, reset]);

  const turn = (degrees: number) => {
    setRotation((current) => ((((current + degrees) % 360) + 360) % 360) as Rotation);
  };

  const untouched = rotation === 0 && !flipH && !flipV;

  const request = useMemo<ProcessRequest | null>(() => {
    if (!image) return null;
    return {
      file: image.file,
      name: image.file.name,
      format,
      quality: quality / 100,
      resize: { mode: 'none' },
      rotate: rotation,
      flipHorizontal: flipH,
      flipVertical: flipV,
    };
  }, [image, format, quality, rotation, flipH, flipV]);

  useDebounced(
    () => {
      void run(request);
    },
    120,
    [request],
  );

  const resultUrl = useObjectUrl(result?.blob ?? null);
  const outputFormat = (result?.type as OutputFormat | undefined) ?? undefined;
  const extension = outputFormat ? FORMAT_EXTENSION[outputFormat] : 'img';
  const suffix = rotation !== 0 ? `-rotated-${rotation}` : flipH || flipV ? '-flipped' : '-copy';
  const filename = image ? addSuffix(replaceExtension(image.file.name, extension), suffix) : '';

  const orientationWords = [
    ROTATION_LABEL[rotation],
    flipH ? 'mirrored across' : null,
    flipV ? 'mirrored down' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const readouts = image
    ? [
        { label: 'Source', value: `${image.facts.width}×${image.facts.height}` },
        { label: 'Orientation', value: orientationWords },
        {
          label: 'Result',
          value: result ? `${result.width}×${result.height}` : busy ? 'working…' : '—',
        },
        { label: 'Result size', value: result ? formatBytes(result.bytes) : '—' },
      ]
    : [];

  return (
    <WorkspacePanel
      label="Rotate and flip image"
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
            label="Drop an image to rotate or flip"
            disabled={loading}
          />
          {loadError ? <ErrorNotice message={loadError} /> : null}
        </div>
      ) : (
        <div className="space-y-5">
          <ReadoutStrip
            items={readouts}
            live
            caption={engine ? `Rotated in this browser · ${engine}` : undefined}
          />

          {runError ? <ErrorNotice message={runError} /> : null}

          <WorkspaceSplit
            controls={
              <>
                <ControlGroup
                  title="Turn"
                  hint="Each press turns the image by a quarter. Four presses brings it back."
                >
                  <div className="grid grid-cols-2 gap-px border border-rule bg-rule">
                    <button
                      type="button"
                      onClick={() => turn(-90)}
                      className="flex items-center justify-center gap-2 bg-surface px-3 py-3 text-sm text-ink transition-colors hover:bg-paper"
                    >
                      <span aria-hidden="true" className="font-mono text-base">
                        ↺
                      </span>
                      Left 90°
                    </button>
                    <button
                      type="button"
                      onClick={() => turn(90)}
                      className="flex items-center justify-center gap-2 bg-surface px-3 py-3 text-sm text-ink transition-colors hover:bg-paper"
                    >
                      <span aria-hidden="true" className="font-mono text-base">
                        ↻
                      </span>
                      Right 90°
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button variant="ghost" onClick={() => turn(180)} className="px-2 py-1">
                      Turn 180°
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setRotation(0);
                        setFlipH(false);
                        setFlipV(false);
                      }}
                      className="px-2 py-1"
                      disabled={untouched}
                    >
                      Reset orientation
                    </Button>
                  </div>
                </ControlGroup>

                <ControlGroup title="Mirror">
                  <div className="space-y-3">
                    <Toggle
                      label="Flip horizontally"
                      checked={flipH}
                      onChange={setFlipH}
                      hint="Left becomes right. Useful for selfies taken on a front camera."
                    />
                    <Toggle
                      label="Flip vertically"
                      checked={flipV}
                      onChange={setFlipV}
                      hint="Top becomes bottom — a true mirror, not a 180° turn."
                    />
                  </div>
                </ControlGroup>

                <ControlGroup title="Output">
                  <FormatPicker value={format} onChange={setFormat} support={support} />
                </ControlGroup>

                {format !== 'image/png' &&
                !(format === 'source' && image.facts.detectedType === 'image/png') ? (
                  <QualitySlider
                    value={quality}
                    onChange={setQuality}
                    hint="Turning an image means writing the file again. A high setting keeps the re-encode close to the original."
                  />
                ) : null}

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
                  beforeMeta={`${image.facts.width}×${image.facts.height} · ${formatBytes(image.facts.bytes)}`}
                  afterMeta={
                    result
                      ? `${result.width}×${result.height} · ${formatBytes(result.bytes)}`
                      : undefined
                  }
                />

                {untouched ? (
                  <CautionNotice message="No turn or mirror is applied yet, so the download would simply be a re-encoded copy. Use the controls to set the orientation you want." />
                ) : null}

                {!untouched && image.facts.detectedType === 'image/jpeg' ? (
                  <CautionNotice message="Rotating a JPG here re-encodes the picture rather than shuffling the existing data, so a small amount of quality is lost. Keep the quality high if that matters for your copy." />
                ) : null}
              </div>
            }
          />
        </div>
      )}
    </WorkspacePanel>
  );
}
