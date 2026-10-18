'use client';

import { useEffect, useState } from 'react';
import { detectEncoderSupport, type EncoderSupport } from '@/lib/image/capabilities';
import type { TargetFormat } from '@/lib/image/types';
import { SegmentedControl, type SegmentOption } from './SegmentedControl';

/**
 * Asks the browser what it can actually write, by encoding an 8×8 test image.
 * Formats are only offered once they have answered for themselves — which is
 * why AVIF appears on some browsers and not others rather than failing later.
 */
export function useEncoderSupport(): EncoderSupport | null {
  const [support, setSupport] = useState<EncoderSupport | null>(null);

  useEffect(() => {
    let alive = true;
    detectEncoderSupport()
      .then((result) => {
        if (alive) setSupport(result);
      })
      .catch(() => {
        if (alive) setSupport({ jpeg: true, png: true, webp: false, avif: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  return support;
}

export function FormatPicker({
  value,
  onChange,
  support,
  includeSource = true,
  sourceLabel = 'Keep',
  legend = 'Output format',
  hint,
}: {
  value: TargetFormat;
  onChange: (value: TargetFormat) => void;
  support: EncoderSupport | null;
  includeSource?: boolean;
  sourceLabel?: string;
  legend?: string;
  hint?: string;
}) {
  const options: SegmentOption<TargetFormat>[] = [];
  if (includeSource) {
    options.push({
      value: 'source',
      label: sourceLabel,
      hint: 'Writes the same format the original used.',
    });
  }
  options.push({ value: 'image/jpeg', label: 'JPG', hint: 'Smallest for photographs. No transparency.' });
  options.push({ value: 'image/png', label: 'PNG', hint: 'Lossless, keeps transparency, larger files.' });
  if (support === null || support.webp) {
    options.push({ value: 'image/webp', label: 'WebP', hint: 'Usually smaller than JPG at the same quality.' });
  }
  if (support?.avif) {
    options.push({ value: 'image/avif', label: 'AVIF', hint: 'Smallest of the four here, but slower to encode.' });
  }

  const columns = options.length >= 5 ? 5 : options.length === 4 ? 4 : 3;

  return (
    <div>
      <SegmentedControl
        legend={legend}
        value={value}
        onChange={onChange}
        options={options}
        columns={columns}
      />
      {hint ? <p className="mt-2 text-xs text-ink-muted">{hint}</p> : null}
      {support && !support.webp ? (
        <p className="mt-2 text-xs text-ink-muted">
          This browser cannot write WebP, so that option is not offered.
        </p>
      ) : null}
    </div>
  );
}
