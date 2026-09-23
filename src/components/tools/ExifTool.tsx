'use client';

import { useCallback, useEffect, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import { addSuffix, formatBytes, replaceExtension } from '@/lib/format';
import { readMetadata, type MetadataReport } from '@/lib/image/metadata';
import { stripMetadata } from '@/lib/image/strip';
import { ImageError } from '@/lib/image/types';
import { processImage } from '@/lib/workers/client';
import { Button } from './Button';
import { DownloadBar } from './DownloadBar';
import { DropZone } from './DropZone';
import { CautionNotice, ErrorNotice } from './ErrorNotice';
import { Toggle } from './Fields';
import { PreviewFrame } from './ImagePreview';
import { ReadoutStrip } from './ReadoutStrip';
import { ControlGroup, LocalBadge, WorkspacePanel, WorkspaceSplit } from './WorkspacePanel';
import { describeError, useObjectUrl, useSingleImage } from './useImageTool';

/** Containers whose metadata can be removed without touching the pixels. */
const LOSSLESS_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

interface Cleaned {
  blob: Blob;
  removed: string[];
  bytesRemoved: number;
  method: 'lossless' | 're-encode';
  /** Result of re-reading the cleaned file, so the claim is checked, not assumed. */
  recheck: 'clean' | 'remaining' | 'unavailable';
  remainingTags: number;
}

export function ExifTool() {
  const { image, loading, error: loadError, load, clear } = useSingleImage();

  const [report, setReport] = useState<MetadataReport | null>(null);
  const [reading, setReading] = useState(false);
  const [keepIcc, setKeepIcc] = useState(true);
  const [cleaned, setCleaned] = useState<Cleaned | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceType = image?.facts.detectedType ?? image?.facts.reportedType ?? null;
  const canStripLosslessly = Boolean(sourceType && LOSSLESS_TYPES.has(sourceType));

  useEffect(() => {
    setCleaned(null);
    setError(null);
    if (!image) {
      setReport(null);
      return;
    }

    let alive = true;
    setReading(true);
    readMetadata(image.file)
      .then((result) => {
        if (alive) setReport(result);
      })
      .catch((thrown) => {
        if (!alive) return;
        setReport(null);
        setError(describeError(thrown));
      })
      .finally(() => {
        if (alive) setReading(false);
      });

    return () => {
      alive = false;
    };
  }, [image]);

  const clean = useCallback(async () => {
    if (!image) return;
    setWorking(true);
    setError(null);
    setCleaned(null);

    try {
      let blob: Blob;
      let removed: string[];
      let bytesRemoved: number;
      let method: Cleaned['method'];

      if (canStripLosslessly) {
        const result = await stripMetadata(image.file, { keepColourProfile: keepIcc });
        blob = new Blob([result.data], { type: sourceType ?? 'application/octet-stream' });
        removed = result.removed;
        bytesRemoved = result.bytesRemoved;
        method = 'lossless';
      } else {
        // No container walker for this format, so fall back to drawing the
        // image and writing a fresh file. The browser's encoder writes no
        // camera metadata, but the pixels are re-compressed.
        const processed = await processImage({
          file: image.file,
          name: image.file.name,
          format: 'image/jpeg',
          quality: 0.92,
          resize: { mode: 'none' },
        });
        blob = processed.blob;
        removed = ['Everything the container held — the file was written from scratch'];
        bytesRemoved = Math.max(0, image.facts.bytes - processed.bytes);
        method = 're-encode';
      }

      // Read the cleaned bytes back rather than trusting the write.
      let recheck: Cleaned['recheck'] = 'unavailable';
      let remainingTags = 0;
      try {
        const after = await readMetadata(blob);
        remainingTags = after.tagCount;
        recheck = after.tagCount === 0 ? 'clean' : 'remaining';
      } catch {
        recheck = 'unavailable';
      }

      setCleaned({ blob, removed, bytesRemoved, method, recheck, remainingTags });
    } catch (thrown) {
      setError(
        thrown instanceof ImageError
          ? thrown.message
          : describeError(thrown),
      );
    } finally {
      setWorking(false);
    }
  }, [image, canStripLosslessly, keepIcc, sourceType]);

  const cleanedUrl = useObjectUrl(cleaned?.blob ?? null);

  // A lossless clean keeps the original container, so the extension stays put.
  const cleanedExtension =
    cleaned?.method === 're-encode'
      ? 'jpg'
      : sourceType === 'image/png'
        ? 'png'
        : sourceType === 'image/webp'
          ? 'webp'
          : 'jpg';
  const filename = image
    ? addSuffix(replaceExtension(image.file.name, cleanedExtension), '-clean')
    : '';

  const readouts = image
    ? [
        {
          label: 'Tags found',
          value: reading ? 'reading…' : report ? String(report.tagCount) : '—',
          tone: report && report.tagCount > 0 ? ('warn' as const) : ('good' as const),
        },
        {
          label: 'Location data',
          value: reading ? '—' : report?.gps ? 'present' : 'none found',
          tone: report?.gps ? ('bad' as const) : ('good' as const),
        },
        { label: 'File size', value: formatBytes(image.facts.bytes) },
        {
          label: 'Cleaned size',
          value: cleaned ? formatBytes(cleaned.blob.size) : working ? 'working…' : '—',
          tone: cleaned ? ('good' as const) : ('default' as const),
        },
      ]
    : [];

  return (
    <WorkspacePanel
      label="EXIF and metadata remover"
      status={
        <>
          <LocalBadge label="Read and cleaned on this device" />
          {image ? (
            <Button variant="ghost" onClick={clear} className="px-2 py-1">
              Start over
            </Button>
          ) : null}
        </>
      }
      footer={
        image && cleaned ? (
          <DownloadBar
            filename={filename}
            bytes={cleaned.blob.size}
            note={cleaned.method === 'lossless' ? 'pixels untouched' : 're-encoded'}
            onDownload={() => downloadBlob(cleaned.blob, filename)}
          />
        ) : undefined
      }
    >
      {!image ? (
        <div className="space-y-4">
          <DropZone
            onFiles={(files) => void load(files)}
            label="Drop an image to inspect and clean"
            hint="JPG, PNG and WebP can be cleaned without re-compressing the picture. Nothing is uploaded."
            disabled={loading}
          />
          {loadError ? <ErrorNotice message={loadError} /> : null}
        </div>
      ) : (
        <div className="space-y-5">
          <ReadoutStrip items={readouts} live caption="Metadata parsed in this browser" />

          {error ? <ErrorNotice message={error} onDismiss={() => setError(null)} /> : null}

          <WorkspaceSplit
            controls={
              <>
                <ControlGroup
                  title="What to remove"
                  hint="Camera, lens, timestamps, GPS, software names and any embedded comments."
                >
                  <Toggle
                    label="Keep the colour profile"
                    checked={keepIcc}
                    onChange={setKeepIcc}
                    hint="An ICC profile describes how colours should be shown. It says nothing about you, and removing it can shift the colours on some screens."
                  />
                </ControlGroup>

                <Button variant="primary" onClick={() => void clean()} disabled={working}>
                  {working ? 'Cleaning…' : cleaned ? 'Clean again' : 'Remove metadata'}
                </Button>

                {!canStripLosslessly ? (
                  <CautionNotice
                    message={`This file is ${
                      sourceType ?? 'an unfamiliar format'
                    }. Only JPG, PNG and WebP can be cleaned byte for byte here, so the cleaned copy is written as a fresh JPG instead — the picture is re-compressed once.`}
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
              <div className="space-y-4">
                <PreviewFrame
                  src={cleanedUrl ?? image.url}
                  alt={image.file.name}
                  label={cleaned ? 'Cleaned copy' : 'Selected image'}
                  meta={`${image.facts.width}×${image.facts.height} · ${formatBytes(
                    cleaned ? cleaned.blob.size : image.facts.bytes,
                  )}`}
                />

                {cleaned ? (
                  <div className="border border-rule bg-surface">
                    <p className="border-b border-rule bg-paper px-3 py-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
                      Result
                    </p>
                    <div className="space-y-3 px-3 py-3 text-sm text-ink">
                      <p>
                        {cleaned.method === 'lossless'
                          ? `Rewritten without the metadata blocks. ${formatBytes(
                              cleaned.bytesRemoved,
                            )} of container data was dropped and the compressed picture data was copied unchanged.`
                          : 'The picture was drawn onto a canvas and written as a new JPG. Nothing from the original container was carried over.'}
                      </p>

                      {cleaned.removed.length > 0 ? (
                        <ul className="space-y-1">
                          {cleaned.removed.map((item, index) => (
                            <li key={`${item}-${index}`} className="flex gap-2 text-ink-muted">
                              <span aria-hidden="true" className="text-signal">
                                −
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-ink-muted">
                          There was nothing to take out — this file carried no metadata blocks.
                        </p>
                      )}

                      <p
                        className={
                          cleaned.recheck === 'clean' ? 'text-sm text-ink' : 'text-sm text-caution'
                        }
                      >
                        {cleaned.recheck === 'clean'
                          ? 'The cleaned file was read back with the same parser: no readable EXIF, XMP or comment tags were found in it.'
                          : cleaned.recheck === 'remaining'
                            ? `The cleaned file was read back and ${cleaned.remainingTags} tag${
                                cleaned.remainingTags === 1 ? '' : 's'
                              } could still be read. Anything the parser cannot see may also remain — check the file in a dedicated tool if this matters legally.`
                            : 'The cleaned file could not be re-read for verification in this browser.'}
                      </p>
                    </div>
                  </div>
                ) : null}

                {!cleaned && report ? (
                  report.empty ? (
                    <div className="border border-rule bg-surface px-3 py-3 text-sm text-ink-muted">
                      No readable metadata was found in this file. Some apps strip it when exporting,
                      and some formats never carry it. You can still write a clean copy if you want
                      one.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {report.gps ? (
                        <CautionNotice
                          message={`This photo carries coordinates: ${report.gps.latitude.toFixed(
                            5,
                          )}, ${report.gps.longitude.toFixed(
                            5,
                          )}. Anyone who receives the file can read them.`}
                        />
                      ) : null}

                      {report.groups.map((group) => (
                        <div key={group.title} className="border border-rule bg-surface">
                          <p
                            className={[
                              'border-b border-rule px-3 py-2 font-mono text-2xs uppercase tracking-wider',
                              group.sensitive
                                ? 'bg-caution-soft text-caution'
                                : 'bg-paper text-ink-muted',
                            ].join(' ')}
                          >
                            {group.title}
                          </p>
                          <dl className="divide-y divide-rule">
                            {group.entries.map((entry) => (
                              <div
                                key={entry.label}
                                className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2"
                              >
                                <dt className="text-xs text-ink-muted">{entry.label}</dt>
                                <dd className="tnum max-w-[60%] break-words text-right text-sm text-ink">
                                  {entry.value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ))}
                    </div>
                  )
                ) : null}
              </div>
            }
          />
        </div>
      )}
    </WorkspacePanel>
  );
}
