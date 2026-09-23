import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { BRAND } from '@/lib/site';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-surface/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-14 max-w-shell items-center justify-between px-[var(--shell-x)]">
        <Link
          href="/"
          className="group flex items-center gap-3 text-ink transition-opacity hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/favicon.svg"
            alt={`${BRAND} Logo`}
            width={28}
            height={28}
            className="h-7 w-7 rounded-sm object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl leading-none">{BRAND}</span>
            <span className="hidden font-mono text-2xs uppercase tracking-wider text-ink-muted sm:inline">
              in-browser image tools
            </span>
          </div>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#all-tools"
            className="px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            All tools
          </Link>
          <Link
            href="/about/"
            className="px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            About
          </Link>
          <div className="ml-1 border-l border-rule pl-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
