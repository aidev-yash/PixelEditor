'use client';

import type { ReactNode } from 'react';
import { formatBytes } from '@/lib/format';
import { Button } from './Button';

export function DownloadBar({
  filename,
  bytes,
  onDownload,
  disabled = false,
  busy = false,
  label = 'Download',
  note,
  secondary,
}: {
  filename: string;
  bytes: number;
  onDownload: () => void;
  disabled?: boolean;
  busy?: boolean;
  label?: string;
  note?: string;
  secondary?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-mono text-xs text-ink" title={filename}>
          {filename}
        </p>
        <p className="tnum mt-0.5 font-mono text-2xs text-ink-muted">
          {formatBytes(bytes)}
          {note ? ` · ${note}` : ''}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {secondary}
        <Button variant="primary" onClick={onDownload} disabled={disabled || busy}>
          {busy ? 'Working…' : label}
          {!busy ? (
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
              <path
                d="M8 3v8m0 0l-3-3m3 3l3-3M3 13h10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          ) : null}
        </Button>
      </div>
    </div>
  );
}
