'use client';

import { useId } from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** Optional one-liner shown under the selected option. */
  hint?: string;
  disabled?: boolean;
}

/**
 * Real radio inputs behind styled labels: arrow keys, screen readers and
 * form semantics all work without any JavaScript keyboard handling.
 */
export function SegmentedControl<T extends string>({
  legend,
  value,
  onChange,
  options,
  columns = 2,
  hideLegend = false,
}: {
  legend: string;
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  columns?: 2 | 3 | 4 | 5;
  hideLegend?: boolean;
}) {
  const name = useId();
  const active = options.find((option) => option.value === value);
  const gridClass =
    columns === 5
      ? 'grid-cols-3 sm:grid-cols-5'
      : columns === 4
        ? 'grid-cols-2 sm:grid-cols-4'
        : columns === 3
          ? 'grid-cols-3'
          : 'grid-cols-2';

  return (
    <fieldset>
      <legend
        className={
          hideLegend
            ? 'sr-only'
            : 'mb-2 font-mono text-2xs uppercase tracking-wider text-ink-muted'
        }
      >
        {legend}
      </legend>
      <div className={`grid gap-px border border-rule bg-rule ${gridClass}`}>
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={[
                'block cursor-pointer bg-surface px-3 py-2 text-center text-sm text-ink transition-colors',
                'hover:bg-paper',
                'peer-checked:bg-instrument peer-checked:font-medium peer-checked:text-white',
                'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[-2px] peer-focus-visible:outline-signal',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-40',
              ].join(' ')}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {active?.hint ? <p className="mt-2 text-xs text-ink-muted">{active.hint}</p> : null}
    </fieldset>
  );
}
