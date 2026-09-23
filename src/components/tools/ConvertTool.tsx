'use client';

import { useEffect, useMemo, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import { addSuffix, formatBytes, formatDelta, replaceExtension } from '@/lib/format';
import { FORMAT_EXTENSION, FORMAT_LABEL, isLossy } from '@/lib/image/encode';
import type { OutputFormat, ProcessRequest } from '@/lib/image/types';
import { isUsingWorker } from '@/lib/workers/client';
import { Button } from './Button';
import { DownloadBar } from './DownloadBar';
import { DropZone } from './DropZone';
import { CautionNotice, ErrorNotice } from './ErrorNotice';
import { ColorField, Toggle } from './Fields';
import { useEncoderSupport } from './FormatPicker';
import { BeforeAfter } from './ImagePreview';
import { QualitySlider } from './QualitySlider';
import { ReadoutStrip } from './ReadoutStrip';
import { ControlGroup, LocalBadge, WorkspacePanel, WorkspaceSplit } from './WorkspacePanel';
import { useDebounced, useObjectUrl, useProcessor, useSingleImage } from './useImageTool';

export interface ConvertToolProps {
  /** The format this page writes. Fixed — the page is the choice. */
  to: OutputFormat;
  /** What the page is named for, e.g. 'JPG'. Used only for wording. */
  sourceLabel: string;
  /** MIME types that count as the expected input for this page. */
  expectedSource: string[];
  /** Default quality for lossy targets. */
  defaultQuality?: number;
}

export function ConvertTool({
  to,
  sourceLabel,
  expectedSource,
  defaultQuality = 88,
}: ConvertToolProps) {
  const { image, loading, error: loadError, load, clear } = useSingleImage();
  const { result, busy, error: runError, run, reset } = useProcessor();
  const support = useEncoderSupport();

  const [quality, setQuality] = useState(defaultQuality);
  const [background, setBackground] = useState('#ffffff');
  const [lossless, setLossless] = useState(false);
  const [engine, setEngine] = useState('');

  const targetLabel = FORMAT_LABEL[to];
  const lossy = isLossy(to) && !(to === 'image/webp' && lossless);

  useEffect(() => {
    setEngine(isUsingWorker() ? 'background thread' : 'main thread');
  }, []);

  useEffect(() => {
    if (!image) reset();
  }, [image, reset]);

  const canWrite =
    support === null
      ? true
      : to === 'image/webp'
        ? support.webp
        : to === 'image/avif'
          ? support.avif
          : to === 'image/png'
            ? support.png
            : support.jpeg;

  const sourceType = image?.facts.detectedType ?? image?.facts.reportedType ?? null;
  const unexpectedSource = Boolean(sourceType && !expectedSource.includes(sourceType));
  const alreadyTarget = sourceType === to;
  const flattening = to === 'image/jpeg' && image?.facts.hasAlpha === true;

  const request = useMemo<ProcessRequest | null>(() => {
    if (!image || !canWrite) return null;
    return {
      file: image.file,
      name: image.file.name,
      format: to,
      quality: quality / 100,
      resize: { mode: 'none' },
      background: to === 'image/jpeg' ? background : undefined,
      lossless: to === 'image/webp' ? lossless : undefined,
    };
  }, [image, canWrite, to, quality, background, lossless]);

  useDebounced(
    () => {
      void run(request);
    },
    160,
    [request],
  );

  const resultUrl = useObjectUrl(result?.blob ?? null);
  const filename = image
    ? replaceExtension(image.file.name, FORMAT_EXTENSION[to])
    : '';
  const safeFilename =
    image && alreadyTarget
      ? addSuffix(replaceExtension(image.file.name, FORMAT_EXTENSION[to]), '-converted')
      : filename;

  const delta = result ? formatDelta(result.sourceBytes, result.bytes) : null;
  const grew = Boolean(result && result.bytes > result.sourceBytes);

  const readouts = image
    ? [
        {
          label: 'Source',
          value: sourceType ? FORMAT_LABEL[sourceType as OutputFormat] ?? sourceType : 'unknown',
        },
        { label: 'Source size', value: formatBytes(image.facts.bytes) },
        { label: 'Output', value: targetLabel },
        {
          label: 'Output size',
          value: result ? `${formatBytes(result.bytes)}${delta ? ` (${delta})` : ''}` : busy ? 'working…' : '—',
          tone: result ? (grew ? ('warn' as const) : ('good' as const)) : ('default' as const),
        },
      ]
    : [];

  return (
    <WorkspacePanel
      label={`Convert to ${targetLabel}`}
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
            filename={safeFilename}
            bytes={result.bytes}
            busy={busy}
            note={`${result.width}×${result.height}`}
            onDownload={() => downloadBlob(result.blob, safeFilename)}
          />
        ) : undefined
      }
    >
      {!image ? (
        <div className="space-y-4">
          <DropZone
            onFiles={(files) => void load(files)}
            label={`Drop a ${sourceLabel} to convert`}
            hint={`Any image this browser can open works — the page is simply set to write ${targetLabel}. Nothing is uploaded.`}
            disabled={loading}
          />
          {loadError ? <ErrorNotice message={loadError} /> : null}
        </div>
      ) : (
        <div className="space-y-5">
          <ReadoutStrip
            items={readouts}
            live
            caption={engine ? `Converted in this browser · ${engine}` : undefined}
          />

          {!canWrite ? (
            <ErrorNotice
              message={`This browser cannot write ${targetLabel}.`}
              detail={`The check runs by asking the browser to encode a tiny test image, and it declined. A current version of Chrome, Edge, Firefox or Safari will handle ${targetLabel}.`}
            />
          ) : null}

          {runError ? <ErrorNotice message={runError} /> : null}

          <WorkspaceSplit
            controls={
              <>
                {lossy ? (
                  <QualitySlider
                    value={quality}
                    onChange={setQuality}
                    hint={`${targetLabel} throws some detail away to save space. 80–90 is a reasonable range for photographs.`}
                  />
                ) : (
                  <p className="text-sm text-ink-muted">
                    {to === 'image/png'
                      ? 'PNG is lossless, so there is no quality setting. Every pixel is kept exactly as it is decoded.'
                      : 'Lossless WebP keeps every pixel, so there is no quality setting.'}
                  </p>
                )}

                {to === 'image/webp' ? (
                  <Toggle
                    label="Lossless WebP"
                    checked={lossless}
                    onChange={setLossless}
                    hint="Keeps every pixel. Good for flat graphics and screenshots; usually much larger for photographs."
                  />
                ) : null}

                {to === 'image/jpeg' ? (
                  <ControlGroup
                    title="Background"
                    hint="JPG has no transparency. Any see-through area is filled with this colour."
                  >
                    <ColorField label="Fill colour" value={background} onChange={setBackground} />
                  </ControlGroup>
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
                  beforeMeta={`${sourceType ? FORMAT_LABEL[sourceType as OutputFormat] ?? sourceType : 'source'} · ${formatBytes(image.facts.bytes)}`}
                  afterMeta={result ? `${targetLabel} · ${formatBytes(result.bytes)}` : undefined}
                />

                {alreadyTarget ? (
                  <CautionNotice
                    message={`This file is already ${targetLabel}. Converting it again re-encodes it, which cannot improve it — the download is named with a “-converted” suffix so you do not overwrite the original by accident.`}
                  />
                ) : unexpectedSource ? (
                  <CautionNotice
                    message={`This page is written for ${sourceLabel} files, and you have given it ${
                      sourceType ? FORMAT_LABEL[sourceType as OutputFormat] ?? sourceType : 'another format'
                    }. The conversion still runs and the result is a valid ${targetLabel}.`}
                  />
                ) : null}

                {flattening ? (
                  <CautionNotice message="This image has transparent areas. JPG cannot store transparency, so those areas are filled with the background colour you chose." />
                ) : null}

                {grew && !alreadyTarget ? (
                  <CautionNotice
                    message={`The ${targetLabel} came out larger than the original. That is normal when converting a compressed photograph to a lossless format, or when the source was already compressed hard.`}
                  />
                ) : null}
              </div>
            }
          />
        </div>
      )}
    </WorkspacePanel>
  );
}
