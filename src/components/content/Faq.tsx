import type { FaqItem } from '@/lib/seo';
import { Reveal } from './Reveal';

export function Faq({ items, delay = 0 }: { items: FaqItem[]; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <section id="faq" className="border-t border-rule pt-8">
        <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
          Questions
        </p>
        <h2 className="font-display text-2xl leading-tight text-ink">Frequently asked questions</h2>

        <div className="mt-5 divide-y divide-rule border-y border-rule">
          {items.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-3 text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
                <span className="max-w-[60ch]">{item.q}</span>
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 font-mono text-lg leading-none text-ink-muted transition-transform duration-150 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[66ch] pb-4 text-sm text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
