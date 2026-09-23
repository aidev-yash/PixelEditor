import Link from 'next/link';
import { getTools, toolHref } from '@/lib/tools';
import { Reveal } from './Reveal';

export function RelatedTools({
  slugs,
  heading = 'Related tools',
  intro,
  delay = 0,
}: {
  slugs: string[];
  heading?: string;
  intro?: string;
  delay?: number;
}) {
  const tools = getTools(slugs);

  return (
    <Reveal delay={delay}>
      <section id="related-tools" className="border-t border-rule pt-8">
        <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
          Keep going
        </p>
        <h2 className="font-display text-2xl leading-tight text-ink">{heading}</h2>
        {intro ? <p className="mt-3 max-w-prose text-ink-muted">{intro}</p> : null}

        <ul className="mt-5 grid gap-px border border-rule bg-rule sm:grid-cols-2">
          {tools.map((tool) => (
            <li key={tool.slug} className="bg-surface">
              <Link
                href={toolHref(tool.slug)}
                className="group flex h-full flex-col gap-1 p-5 transition-colors hover:bg-paper"
              >
                <span className="font-mono text-2xs uppercase tracking-wider text-ink-muted">
                  {tool.category}
                </span>
                <span className="text-base font-semibold text-ink group-hover:text-signal">
                  {tool.name}
                </span>
                <span className="text-sm text-ink-muted">{tool.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}
