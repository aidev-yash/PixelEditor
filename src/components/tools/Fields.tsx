'use client';

import { useId } from 'react';

export function Toggle({
  label,
  checked,
  onChange,
  hint,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-[3px] h-4 w-4 shrink-0 accent-[var(--instrument)] disabled:opacity-50"
        />
        <label htmlFor={id} className="text-sm text-ink">
          {label}
        </label>
      </div>
      {hint ? <p className="mt-1 pl-[26px] text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  hint,
  presets = ['#ffffff', '#000000', '#f5f6f7'],
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  presets?: string[];
}) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-ink">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer border border-rule bg-surface p-1"
        />
        <span className="tnum font-mono text-xs uppercase text-ink-muted">{value}</span>
        <div className="ml-auto flex gap-1">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              aria-label={`Use ${preset}`}
              aria-pressed={preset.toLowerCase() === value.toLowerCase()}
              className={`h-7 w-7 border ${
                preset.toLowerCase() === value.toLowerCase() ? 'border-instrument' : 'border-rule'
              }`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
