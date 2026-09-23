import Link from 'next/link';
import { BRAND } from '@/lib/site';
import { Reveal } from './Reveal';

/**
 * Short "about us" block that closes every tool page. The full story lives at
 * /about/ — this is the summary plus the link the page-structure spec requires.
 */
export function AboutSection({ delay = 0 }: { delay?: number }) {
  return (
    <Reveal delay={delay}>
      <section id="about-us" className="border-t border-rule pt-8">
        <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
          About us
        </p>
        <h2 className="font-display text-2xl leading-tight text-ink">Who builds {BRAND}</h2>
        <div className="prose-editorial mt-4 text-ink">
          <p>
            {BRAND} is a small set of single-purpose image tools that run inside your web browser.
            Each one does a specific job — resize, crop, rotate, compress, convert, inspect, strip
            metadata — and each one has its own page so you can bookmark exactly the tool you keep
            needing.
          </p>
          <p>
            The tools are built with the Canvas API and Web Workers. When you pick a file, the
            browser reads it from your own disk, works on it in memory, and hands you the result
            back as a download. There is no processing server involved, so there is no upload step,
            no queue, and no account.
          </p>
          <p>
            Everything is free, there are no watermarks, and there is no paid tier that unlocks the
            real version.{' '}
            <Link href="/about/" className="text-signal underline underline-offset-2">
              Read more about how {BRAND} works and why
            </Link>
            .
          </p>
        </div>
      </section>
    </Reveal>
  );
}
