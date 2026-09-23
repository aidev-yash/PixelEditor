import type { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';
import { LEGAL_LAST_UPDATED } from '@/lib/site';

export interface LegalTocItem {
  id: string;
  title: string;
}

interface LegalPageProps {
  /** Page heading, e.g. "Privacy Policy". */
  title: string;
  /** One or two sentences under the heading. */
  deck: string;
  /** Route with leading and trailing slash, e.g. '/privacy/'. */
  path: string;
  /** Breadcrumb label; defaults to the title. */
  crumbName?: string;
  /** Anchors listed in the contents nav. Must match the LegalSection ids. */
  toc: LegalTocItem[];
  /** Set false on pages that are not dated policy documents. */
  dated?: boolean;
  /** Additional structured data schemas. */
  jsonLd?: Record<string, unknown>[];
  children: ReactNode;
}

/**
 * Plain, readable frame for the legal and about pages. Deliberately unlike the
 * tool pages: no workspace, and nothing that could overlay or block a tool —
 * the spec forbids legal text interfering with the workspace, so it lives only
 * on its own routes.
 */
export function LegalPage({
  title,
  deck,
  path,
  crumbName,
  toc,
  dated = true,
  jsonLd = [],
  children,
}: LegalPageProps) {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: crumbName ?? title, path },
  ];

  return (
    <>
      <div className="mx-auto max-w-shell px-[var(--shell-x)] pb-16 pt-8">
        <Breadcrumbs items={crumbs} />

        <header className="mt-5 max-w-prose">
          <h1 className="font-display text-3xl leading-[1.08] text-ink sm:text-4xl">{title}</h1>
          <p className="mt-4 text-lg text-ink-muted">{deck}</p>
          {dated ? (
            <p className="mt-4 font-mono text-2xs uppercase tracking-wider text-ink-muted">
              Last updated {LEGAL_LAST_UPDATED}
            </p>
          ) : null}
        </header>

        {toc.length > 0 ? (
          <nav aria-label="On this page" className="mt-10 max-w-prose border border-rule bg-surface">
            <p className="border-b border-rule bg-paper px-4 py-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
              On this page
            </p>
            <ol className="grid gap-x-8 gap-y-2 px-4 py-4 sm:grid-cols-2">
              {toc.map((item, index) => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <span className="tnum font-mono text-2xs text-ink-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <a href={`#${item.id}`} className="text-ink hover:text-signal">
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <article className="mt-12 max-w-prose space-y-10">{children}</article>
      </div>

      <JsonLd data={[breadcrumbJsonLd(crumbs), ...jsonLd]} />
    </>
  );
}

/** One numbered clause of a policy page. */
export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-rule pt-8">
      <h2 className="font-display text-2xl leading-tight text-ink">{title}</h2>
      <div className="prose-editorial mt-4 text-ink">{children}</div>
    </section>
  );
}
