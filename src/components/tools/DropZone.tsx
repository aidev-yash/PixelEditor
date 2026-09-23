'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_LABEL, collectImageFiles } from '@/lib/download';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  /** Visible call to action. */
  label?: string;
  hint?: string;
  /** Slim variant used once a file is already loaded. */
  compact?: boolean;
  disabled?: boolean;
}

/**
 * Drag-and-drop target that is always paired with a real <input type="file">,
 * so the tool is fully usable with a keyboard, a screen reader, or a touch
 * device that has no drag gesture.
 */
export function DropZone({
  onFiles,
  multiple = false,
  label,
  hint,
  compact = false,
  disabled = false,
}: DropZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const heading = label ?? (multiple ? 'Drop images here' : 'Drop an image here');

  const handleFiles = useCallback(
    (list: FileList | null) => {
      const files = collectImageFiles(list);
      if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1));
    },
    [multiple, onFiles],
  );

  return (
    <div
      onDragEnter={(event) => {
        if (disabled) return;
        event.preventDefault();
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={(event) => {
        if (disabled) return;
        event.preventDefault();
        depth.current = 0;
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={[
        'relative border border-dashed text-center transition-colors',
        compact ? 'px-4 py-5' : 'px-6 py-12 sm:py-16',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-default',
        dragging ? 'border-signal bg-signal-soft' : 'border-rule bg-paper',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files);
          // Allow re-selecting the same file straight after a download.
          event.target.value = '';
        }}
      />

      {!compact ? (
        <p className="font-display text-xl text-ink">{heading}</p>
      ) : null}

      <div className={compact ? '' : 'mt-3'}>
        <label
          htmlFor={inputId}
          className={[
            'inline-flex cursor-pointer items-center gap-2 border border-instrument bg-instrument px-4 py-2 text-sm font-medium text-white transition-opacity',
            disabled ? 'pointer-events-none' : 'hover:opacity-90',
          ].join(' ')}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
            <path
              d="M8 11V3m0 0L5 6m3-3l3 3M3 12v1h10v-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          {multiple ? 'Choose images' : 'Choose an image'}
        </label>
      </div>

      <p className={`${compact ? 'mt-2' : 'mt-4'} text-xs text-ink-muted`}>
        {hint ?? `${ACCEPTED_LABEL}. Files stay on this device — nothing is uploaded.`}
      </p>
    </div>
  );
}
