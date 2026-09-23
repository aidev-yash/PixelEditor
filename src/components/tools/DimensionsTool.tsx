'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ACCEPTED_LABEL } from '@/lib/download';
import {
  commonRatioName,
  formatAspectRatio,
  formatBytes,
  formatDimensions,
  formatMegapixels,
} from '@/lib/format';
import { inspect } from '@/lib/image/pipeline';
import type { ImageFacts } from '@/lib/image/types';
import { Button } from './Button';
import { DropZone } from './DropZone';
import { CautionNotice, ErrorNotice } from './ErrorNotice';
import { PreviewFrame } from './ImagePreview';
import { ReadoutStrip } from './ReadoutStrip';
import { SegmentedControl } from './SegmentedControl';
import { ControlGroup, LocalBadge, WorkspacePanel, WorkspaceSplit } from './WorkspacePanel';
import { describeError } from './useImageTool';

interface Entry {
  id: string;
  file: File;
  url: string;
  facts: ImageFacts;
}

type Dpi = '72' | '150' | '300';

const TYPE_LABEL: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
  'image/bmp': 'BMP',
  'image/avif': 'AVIF',
};

function typeName(type: string | null | undefined): string {
  if (!type) return 'unknown';
  return TYPE_LABEL[type] ?? type.replace('image/', '').toUpperCase();
}

function orientationOf(width: number, height: number): string {
  if (width === height) return 'Square';
  return width > height ? 'Landscape' : 'Portrait';
}

function printSize(px: number, dpi: number): string {
  const inches = px / dpi;
  const cm = inches * 2.54;
  return `${inches.toFixed(2)} in / ${cm.toFixed(1)} cm`;
}

export function DimensionsTool() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [dpi, setDpi] = useState<Dpi>('300');
  const [copied, setCopied] = useState(false);

  const urlsRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = [];
    },
    [],
  );

  const addFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setReading(true);
    setError(null);
    const added: Entry[] = [];
    const failures: string[] = [];

    for (const file of files) {
      try {
        const facts = await inspect(file);
        const url = URL.createObjectURL(file);
        urlsRef.current.push(url);
        added.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${urlsRef.current.length}`,
          file,
          url,
          facts,
        });
      } catch (thrown) {
        failures.push(`${file.name}: ${describeError(thrown)}`);
      }
    }

    if (added.length > 0) {
      setEntries((current) => [...current, ...added]);
      setSelectedId((current) => current ?? added[0].id);
    }
    if (failures.length > 0) setError(failures.join(' · '));
    setReading(false);
  }, []);

  const clearAll = useCallback(() => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
    setEntries([]);
    setSelectedId(null);
    setError(null);
    setCopied(false);
  }, []);

  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0] ?? null;

  const copyDetails = useCallback(async () => {
    if (entries.length === 0) return;
    const lines = entries.map((entry) =>
      [
        entry.file.name,
        formatDimensions(entry.facts.width, entry.facts.height),
        formatAspectRatio(entry.facts.width, entry.facts.height),
        formatMegapixels(entry.facts.width, entry.facts.height),
        formatBytes(entry.facts.bytes),
        typeName(entry.facts.detectedType ?? entry.facts.reportedType),
      ].join('\t'),
    );
    const text = ['Filename\tDimensions\tRatio\tMegapixels\tFile size\tFormat', ...lines].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(
        'This browser would not give the page clipboard access. You can still select the table text and copy it by hand.',
      );
    }
  }, [entries]);

  const readouts = selected
    ? [
        {
          label: 'Width',
          value: `${selected.facts.width} px`,
        },
        {
          label: 'Height',
          value: `${selected.facts.height} px`,
        },
        {
          label: 'Aspect ratio',
          value: formatAspectRatio(selected.facts.width, selected.facts.height),
        },
        {
          label: 'File size',
          value: formatBytes(selected.facts.bytes),
        },
      ]
    : [];

  const mismatch =
    selected &&
    selected.facts.detectedType &&
    selected.facts.reportedType &&
    selected.facts.detectedType !== selected.facts.reportedType;

  return (
    <WorkspacePanel
      label="Image dimensions checker"
      status={
        <>
          <LocalBadge label="Read on this device" />
          {entries.length > 0 ? (
            <Button variant="ghost" onClick={clearAll} className="px-2 py-1">
              Clear list
            </Button>
          ) : null}
        </>
      }
      footer={
        entries.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">
              {entries.length} {entries.length === 1 ? 'image' : 'images'} measured. Nothing is
              re-saved — this tool only reads.
            </p>
            <Button variant="primary" onClick={() => void copyDetails()}>
              {copied ? 'Copied' : 'Copy all details'}
            </Button>
          </div>
        ) : undefined
      }
    >
      {entries.length === 0 ? (
        <div className="space-y-4">
          <DropZone
            multiple
            onFiles={(files) => void addFiles(files)}
            label="Drop images to measure"
            hint={`${ACCEPTED_LABEL}. Drop several at once to compare them. Nothing is uploaded.`}
            disabled={reading}
          />
          {error ? <ErrorNotice message={error} onDismiss={() => setError(null)} /> : null}
        </div>
      ) : (
        <div className="space-y-5">
          <ReadoutStrip
            items={readouts}
            live
            caption={selected ? `Measured in this browser · ${selected.file.name}` : undefined}
          />

          {error ? <ErrorNotice message={error} onDismiss={() => setError(null)} /> : null}

          <WorkspaceSplit
            controls={
              <>
                <ControlGroup
                  title="Print size at"
                  hint="A pixel has no physical size until you choose a print density. 300 is the usual figure for photo printing, 72 for screen mock-ups."
                >
                  <SegmentedControl<Dpi>
                    legend="Print density"
                    hideLegend
                    value={dpi}
                    onChange={setDpi}
                    columns={3}
                    options={[
                      { value: '72', label: '72 DPI' },
                      { value: '150', label: '150 DPI' },
                      { value: '300', label: '300 DPI' },
                    ]}
                  />
                </ControlGroup>

                {selected ? (
                  <dl className="divide-y divide-rule border border-rule">
                    {[
                      { term: 'Filename', detail: selected.file.name },
                      {
                        term: 'Dimensions',
                        detail: `${formatDimensions(selected.facts.width, selected.facts.height)} px`,
                      },
                      {
                        term: 'Megapixels',
                        detail: formatMegapixels(selected.facts.width, selected.facts.height),
                      },
                      {
                        term: 'Aspect ratio',
                        detail: [
                          formatAspectRatio(selected.facts.width, selected.facts.height),
                          commonRatioName(selected.facts.width, selected.facts.height),
                        ]
                          .filter(Boolean)
                          .join(' · '),
                      },
                      {
                        term: 'Orientation',
                        detail: orientationOf(selected.facts.width, selected.facts.height),
                      },
                      { term: 'File size', detail: formatBytes(selected.facts.bytes) },
                      {
                        term: 'Format',
                        detail: typeName(selected.facts.detectedType ?? selected.facts.reportedType),
                      },
                      {
                        term: 'Transparency',
                        detail:
                          selected.facts.hasAlpha === null
                            ? 'not determined for this format'
                            : selected.facts.hasAlpha
                              ? 'has an alpha channel'
                              : 'no alpha channel',
                      },
                      {
                        term: `Print width @ ${dpi} DPI`,
                        detail: printSize(selected.facts.width, Number(dpi)),
                      },
                      {
                        term: `Print height @ ${dpi} DPI`,
                        detail: printSize(selected.facts.height, Number(dpi)),
                      },
                    ].map((row) => (
                      <div
                        key={row.term}
                        className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2"
                      >
                        <dt className="font-mono text-2xs uppercase tracking-wider text-ink-muted">
                          {row.term}
                        </dt>
                        <dd className="tnum max-w-[60%] break-words text-right text-sm text-ink">
                          {row.detail}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <DropZone
                  compact
                  multiple
                  onFiles={(files) => void addFiles(files)}
                  label="Add more images"
                  hint="They are appended to the list below."
                />
              </>
            }
            preview={
              <div className="space-y-4">
                {selected ? (
                  <PreviewFrame
                    src={selected.url}
                    alt={selected.file.name}
                    label="Selected image"
                    meta={`${formatDimensions(selected.facts.width, selected.facts.height)} · ${formatBytes(
                      selected.facts.bytes,
                    )}`}
                  />
                ) : null}

                {mismatch && selected ? (
                  <CautionNotice
                    message={`The file is named as ${typeName(
                      selected.facts.reportedType,
                    )} but its contents are ${typeName(
                      selected.facts.detectedType,
                    )}. The measurements above come from the actual contents.`}
                  />
                ) : null}

                <div className="overflow-x-auto border border-rule">
                  <table className="w-full border-collapse text-sm">
                    <caption className="sr-only">
                      Every image you have added, with its dimensions and file size. Select a row to
                      see its full details.
                    </caption>
                    <thead>
                      <tr className="bg-paper text-left">
                        {['File', 'Dimensions', 'Ratio', 'Size', ''].map((heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="border-b border-rule px-3 py-2 font-mono text-2xs uppercase tracking-wider text-ink-muted"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => {
                        const isSelected = selected?.id === entry.id;
                        return (
                          <tr
                            key={entry.id}
                            className={isSelected ? 'bg-local-soft' : undefined}
                            aria-current={isSelected ? 'true' : undefined}
                          >
                            <td className="border-b border-rule px-3 py-2">
                              <button
                                type="button"
                                onClick={() => setSelectedId(entry.id)}
                                className="max-w-[18ch] truncate text-left text-ink underline-offset-2 hover:underline sm:max-w-[28ch]"
                                title={entry.file.name}
                              >
                                {entry.file.name}
                              </button>
                            </td>
                            <td className="tnum border-b border-rule px-3 py-2 font-mono text-xs">
                              {formatDimensions(entry.facts.width, entry.facts.height)}
                            </td>
                            <td className="tnum border-b border-rule px-3 py-2 font-mono text-xs">
                              {formatAspectRatio(entry.facts.width, entry.facts.height)}
                            </td>
                            <td className="tnum border-b border-rule px-3 py-2 font-mono text-xs">
                              {formatBytes(entry.facts.bytes)}
                            </td>
                            <td className="border-b border-rule px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setEntries((current) =>
                                    current.filter((item) => item.id !== entry.id),
                                  );
                                  if (selectedId === entry.id) setSelectedId(null);
                                }}
                                className="font-mono text-2xs uppercase tracking-wider text-ink-muted transition-colors hover:text-ink"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          />
        </div>
      )}
    </WorkspacePanel>
  );
}
