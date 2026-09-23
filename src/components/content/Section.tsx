import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

export function Section({
  id,
  title,
  eyebrow,
  children,
  delay = 0,
}: {
  id?: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <section id={id} className="border-t border-rule pt-8">
        {eyebrow ? (
          <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-2xl leading-tight text-ink">{title}</h2>
        <div className="prose-editorial mt-4 text-ink">{children}</div>
      </section>
    </Reveal>
  );
}

/** Numbered how-to steps with monospaced markers. */
export function Steps({ items }: { items: { title: string; detail: string }[] }) {
  return (
    <ol className="mt-2 space-y-4">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-4">
          <span
            aria-hidden="true"
            className="mt-1 h-6 w-6 shrink-0 border border-rule text-center font-mono text-xs leading-[22px] text-ink-muted"
          >
            {index + 1}
          </span>
          <span className="max-w-[62ch]">
            <strong className="font-semibold">{item.title}.</strong>{' '}
            <span className="text-ink-muted">{item.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Label/description pairs used for settings and format tables. */
export function DefinitionList({ items }: { items: { term: string; detail: string }[] }) {
  return (
    <dl className="mt-2 divide-y divide-rule border-y border-rule">
      {items.map((item) => (
        <div key={item.term} className="grid gap-1 py-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
          <dt className="font-mono text-xs uppercase tracking-wide text-ink">{item.term}</dt>
          <dd className="text-sm text-ink-muted">{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Honest limitations list — every tool page has one. */
export function LimitList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-ink-muted">
          <span aria-hidden="true" className="mt-[10px] h-px w-3 shrink-0 bg-caution" />
          <span className="max-w-[62ch]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Benefit list used by the "why use this" section. */
export function BenefitList({ items }: { items: { title: string; detail: string }[] }) {
  return (
    <ul className="mt-2 grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.title} className="border border-rule bg-surface p-4">
          <p className="text-sm font-semibold text-ink">{item.title}</p>
          <p className="mt-1 text-sm text-ink-muted">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}
