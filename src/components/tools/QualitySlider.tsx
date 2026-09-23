'use client';

import { useId } from 'react';

const WORDS: [number, string][] = [
  [95, 'near-original'],
  [85, 'high'],
  [70, 'good'],
  [50, 'moderate'],
  [30, 'low'],
  [0, 'very low'],
];

function describe(value: number): string {
  for (const [threshold, word] of WORDS) {
    if (value >= threshold) return word;
  }
  return 'very low';
}

export function QualitySlider({
  value,
  onChange,
  label = 'Quality',
  disabled = false,
  hint,
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
  hint?: string;
}) {
  const id = useId();

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium text-ink">
          {label}
        </label>
        <span className="tnum font-mono text-xs text-ink-muted">
          {value} · {describe(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={5}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-6 w-full cursor-pointer accent-[var(--instrument)] disabled:cursor-not-allowed disabled:opacity-60"
      />
      <p className="mt-1 text-xs text-ink-muted">
        {hint ?? 'Higher keeps more detail and makes a larger file. Lower does the opposite.'}
      </p>
    </div>
  );
}
