'use client';

import type { ReactNode } from 'react';

/**
 * A single preview pane. Object URLs point at in-memory blobs, so next/image
 * would have nothing to optimise — a plain <img> is the correct element here.
 */
export function PreviewFrame({
  src,
  alt,
  label,
  meta,
  checkerboard = true,
  tall = false,
  overlay,
}: {
  src: string;
  alt: string;
  label: string;
  meta?: string;
  checkerboard?: boolean;
  tall?: boolean;
  overlay?: ReactNode;
}) {
  return (
    <figure className="min-w-0 border border-rule bg-surface">
      <div
        className={[
          'relative flex items-center justify-center overflow-hidden p-3',
          checkerboard ? 'checkerboard' : 'bg-paper',
          tall ? 'min-h-[320px]' : 'min-h-[200px]',
        ].join(' ')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={`w-auto max-w-full object-contain ${tall ? 'max-h-[440px]' : 'max-h-[300px]'}`}
        />
        {overlay}
      </div>
      <figcaption className="flex items-baseline justify-between gap-3 border-t border-rule px-3 py-2">
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-muted">{label}</span>
        {meta ? <span className="tnum font-mono text-2xs text-ink">{meta}</span> : null}
      </figcaption>
    </figure>
  );
}

/** Side-by-side original and result. Stacks on small screens. */
export function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeMeta,
  afterMeta,
  alt,
}: {
  beforeSrc: string;
  afterSrc: string | null;
  beforeMeta?: string;
  afterMeta?: string;
  alt: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PreviewFrame src={beforeSrc} alt={`Original: ${alt}`} label="Before" meta={beforeMeta} />
      {afterSrc ? (
        <PreviewFrame src={afterSrc} alt={`Result: ${alt}`} label="After" meta={afterMeta} />
      ) : (
        <div className="flex min-h-[200px] items-center justify-center border border-dashed border-rule bg-paper p-6 text-center">
          <p className="max-w-[28ch] text-sm text-ink-muted">
            The result appears here once the settings are applied.
          </p>
        </div>
      )}
    </div>
  );
}

export function EmptyPreview({ message }: { message: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center border border-dashed border-rule bg-paper p-6 text-center">
      <p className="max-w-[34ch] text-sm text-ink-muted">{message}</p>
    </div>
  );
}
