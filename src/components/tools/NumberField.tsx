'use client';

import { useEffect, useId, useState } from 'react';
import { clamp } from '@/lib/format';

interface NumberFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
}

function parse(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Numeric input that tolerates a half-typed value. Clamping happens on blur,
 * not on every keystroke, so typing "1" into a field with a minimum of 16
 * does not fight the user.
 */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  hint,
  placeholder,
  disabled = false,
}: NumberFieldProps) {
  const id = useId();
  const [text, setText] = useState(value === null ? '' : String(value));

  useEffect(() => {
    setText((previous) => (parse(previous) === value ? previous : value === null ? '' : String(value)));
  }, [value]);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-ink">
        {label}
      </label>
      <div
        className={`mt-1 flex items-center border bg-surface ${
          disabled ? 'border-rule opacity-60' : 'border-rule focus-within:border-instrument'
        }`}
      >
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={text}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => {
            setText(event.target.value);
            onChange(parse(event.target.value));
          }}
          onBlur={() => {
            const parsed = parse(text);
            if (parsed === null) return;
            const bounded = clamp(parsed, min ?? -Infinity, max ?? Infinity);
            const rounded = step >= 1 ? Math.round(bounded) : bounded;
            if (rounded !== parsed) {
              setText(String(rounded));
              onChange(rounded);
            }
          }}
          className="tnum w-full bg-transparent px-3 py-2 font-mono text-sm text-ink outline-none"
        />
        {suffix ? (
          <span className="shrink-0 pr-3 font-mono text-2xs uppercase tracking-wider text-ink-muted">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
