import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND } from '@/lib/site';
import { toolHref, toolsByCategory } from '@/lib/tools';

export const metadata: Metadata = {
  title: `Page not found — ${BRAND}`,
  description: 'That page does not exist. Every PixelEditor tool is listed here.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const groups = toolsByCategory();

  return (
    <div className="mx-auto max-w-shell px-[var(--shell-x)] pb-16 pt-12">
      <p className="font-mono text-2xs uppercase tracking-wider text-ink-muted">Error 404</p>
      <h1 className="mt-3 max-w-prose font-display text-3xl leading-[1.08] text-ink sm:text-4xl">
        That page isn’t here
      </h1>
      <p className="mt-4 max-w-prose text-lg text-ink-muted">
        The address may have changed, or it may never have existed. Nothing was lost — no file is
        ever held on a server here, so there is nothing to recover. Every tool is listed below.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="border border-ink bg-ink px-4 py-2 text-sm text-paper hover:bg-ink-muted"
        >
          Go to the homepage
        </Link>
        <Link
          href="/about/"
          className="border border-rule bg-surface px-4 py-2 text-sm text-ink hover:border-ink"
        >
          About {BRAND}
        </Link>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.category}>
            <h2 className="font-mono text-2xs uppercase tracking-wider text-ink-muted">
              {group.category}
            </h2>
            <ul className="mt-3 space-y-2">
              {group.tools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={toolHref(tool.slug)}
                    className="text-sm text-ink underline decoration-rule underline-offset-4 hover:decoration-signal"
                  >
                    {tool.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-muted">{tool.blurb}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
