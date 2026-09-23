import Link from 'next/link';
import { BRAND, CONTACT_EMAIL } from '@/lib/site';
import { toolHref, toolsByCategory } from '@/lib/tools';

export function SiteFooter() {
  const groups = toolsByCategory();

  return (
    <footer className="mt-20 border-t border-rule bg-surface">
      <div className="mx-auto max-w-shell px-[var(--shell-x)] py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/favicon.svg"
                alt={`${BRAND} Logo`}
                width={24}
                height={24}
                className="h-6 w-6 rounded-sm object-contain"
              />
              <p className="font-display text-xl">{BRAND}</p>
            </div>
            <p className="mt-3 max-w-[38ch] text-sm text-ink-muted">
              Image tools that do their work in your browser. No accounts, no watermarks, and no
              upload step before you can use them.
            </p>
            <p className="mt-4 font-mono text-2xs uppercase tracking-wider text-ink-muted">
              Contact
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-sm text-signal underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.category}>
                <h2 className="mb-3 font-mono text-2xs uppercase tracking-wider text-ink-muted">
                  {group.category}
                </h2>
                <ul className="space-y-2">
                  {group.tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={toolHref(tool.slug)}
                        className="text-sm text-ink transition-colors hover:text-signal"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-2xs text-ink-muted">
            © {new Date().getFullYear()} {BRAND}
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/about/" className="text-sm text-ink-muted hover:text-ink">
              About us
            </Link>
            <Link href="/terms/" className="text-sm text-ink-muted hover:text-ink">
              Terms of Service
            </Link>
            <Link href="/privacy/" className="text-sm text-ink-muted hover:text-ink">
              Privacy Policy
            </Link>
            <Link href="/cookies/" className="text-sm text-ink-muted hover:text-ink">
              Cookie Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
