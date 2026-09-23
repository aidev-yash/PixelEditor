export function ProgressBar({
  value,
  label,
  detail,
}: {
  /** 0–100. */
  value: number;
  label: string;
  detail?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-2xs uppercase tracking-wider text-ink-muted">{label}</p>
        <p className="tnum font-mono text-xs text-ink">{clamped}%</p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="mt-2 h-1 w-full overflow-hidden bg-rule"
      >
        <div className="progress-fill h-full bg-instrument" style={{ width: `${clamped}%` }} />
      </div>
      <p aria-live="polite" className="mt-2 min-h-[1rem] text-xs text-ink-muted">
        {detail ?? ''}
      </p>
    </div>
  );
}
