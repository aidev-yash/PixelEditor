export type ReadoutTone = 'default' | 'good' | 'warn' | 'bad';

export interface Readout {
  label: string;
  value: string;
  tone?: ReadoutTone;
}

const TONE: Record<ReadoutTone, string> = {
  default: 'text-white',
  good: 'text-[#4ade80]',
  warn: 'text-[#fbbf24]',
  bad: 'text-[#fca5a5]',
};

/**
 * The instrument bar: IN … → OUT …. Numbers are tabular so they do not
 * jitter while a slider is being dragged.
 */
export function ReadoutStrip({
  items,
  live = false,
  caption,
}: {
  items: Readout[];
  /** Announce updates to assistive tech (used for results, not for drags). */
  live?: boolean;
  caption?: string;
}) {
  return (
    <div className="bg-instrument">
      <dl
        className="grid grid-cols-2 gap-px sm:grid-cols-4"
        {...(live ? { 'aria-live': 'polite' as const } : {})}
      >
        {items.map((item) => (
          <div key={item.label} className="px-4 py-3">
            <dt className="font-mono text-2xs uppercase tracking-wider text-white/55">
              {item.label}
            </dt>
            <dd className={`tnum mt-1 font-mono text-sm ${TONE[item.tone ?? 'default']}`}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      {caption ? (
        <p className="border-t border-white/10 px-4 py-2 font-mono text-2xs text-white/55">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
