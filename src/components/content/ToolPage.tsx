import Link from 'next/link';
import type { ReactNode } from 'react';
import { AboutSection } from '@/components/content/AboutSection';
import { Faq } from '@/components/content/Faq';
import { RelatedTools } from '@/components/content/RelatedTools';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { ToolSwitcher } from '@/components/layout/ToolSwitcher';
import type { FaqItem } from '@/lib/seo';
import { breadcrumbJsonLd, faqJsonLd, softwareApplicationJsonLd } from '@/lib/seo';
import { BRAND } from '@/lib/site';
import { getTool } from '@/lib/tools';

interface ToolPageProps {
  slug: string;
  /** The interactive client component. Always rendered above the article text. */
  workspace: ReactNode;
  /** Feature bullets used for SoftwareApplication structured data. */
  features: string[];
  faq: FaqItem[];
  /** One sentence introducing the related-tools grid. */
  relatedIntro?: string;
  /** The page's unique long-form sections. */
  children: ReactNode;
}

/**
 * Shared frame for all fourteen tool pages.
 *
 * Order is fixed by the page-structure spec: brand (in the header) → tool name
 * as the h1 → the working tool → the switcher → the about link → everything
 * else. The tool is never pushed below the article text.
 */
export function ToolPage({
  slug,
  workspace,
  features,
  faq,
  relatedIntro,
  children,
}: ToolPageProps) {
  const tool = getTool(slug);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: tool.name, path: `/${tool.slug}/` },
  ];

  return (
    <>
      <div className="mx-auto max-w-shell px-[var(--shell-x)] pb-16 pt-8">
        <Breadcrumbs items={crumbs} />

        <header className="mt-5 max-w-prose">
          <h1 className="font-display text-3xl leading-[1.08] text-ink sm:text-4xl">{tool.h1}</h1>
          <p className="mt-4 text-lg text-ink-muted">{tool.deck}</p>
        </header>

        {/* The workspace sits directly under the heading, before any article text. */}
        <div className="mt-8">{workspace}</div>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:items-center">
          <ToolSwitcher currentSlug={tool.slug} />
          <p className="text-sm text-ink-muted">
            New here?{' '}
            <Link href="/about/" className="text-signal underline underline-offset-2">
              About {BRAND} and what we offer
            </Link>{' '}
            — what these tools do, and why they run on your device.
          </p>
        </div>

        <article className="mt-14 space-y-12">
          {children}
          <Faq items={faq} />
          <RelatedTools slugs={tool.related} intro={relatedIntro} />
          <AboutSection />
        </article>
      </div>

      <JsonLd
        data={[
          softwareApplicationJsonLd(tool, features),
          breadcrumbJsonLd(crumbs),
          faqJsonLd(faq),
        ]}
      />
    </>
  );
}
