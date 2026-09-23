'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { TOOLS, toolHref, toolsByCategory } from '@/lib/tools';

/**
 * Jump to any other tool without going back to the homepage.
 *
 * Built on <details> so it works with the keyboard by default and still
 * renders real, crawlable links to every tool from every page.
 */
export function ToolSwitcher({ currentSlug }: { currentSlug?: string }) {
  const ref = useRef<HTMLDetailsElement | null>(null);
  const groups = toolsByCategory();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const close = () => {
      element.open = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && element.open) {
        close();
        element.querySelector('summary')?.focus();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      if (element.open && event.target instanceof Node && !element.contains(event.target)) {
        close();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  return (
    <details ref={ref} className="group relative">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border border-rule bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-instrument focus-visible:border-instrument [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <span className="font-mono text-2xs uppercase tracking-wider text-ink-muted">
            Switch tool
          </span>
          <span className="text-ink-muted">·</span>
          <span>{TOOLS.length} tools</span>
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-150 group-open:rotate-180"
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </summary>

      <div className="absolute left-0 right-0 z-30 mt-1 max-h-[70vh] overflow-y-auto border border-instrument bg-surface p-4 shadow-[0_12px_32px_rgba(15,20,25,0.12)]">
        <div className="grid gap-5 sm:grid-cols-2">
          {groups.map((group) => (
            <div key={group.category}>
              {/* A <p>, not a heading: this list is navigation, and category
                  labels in the document outline would sit ahead of the page's
                  real h2s on every tool page. */}
              <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
                {group.category}
              </p>
              <ul className="space-y-1">
                {group.tools.map((tool) => {
                  const isCurrent = tool.slug === currentSlug;
                  return (
                    <li key={tool.slug}>
                      <Link
                        href={toolHref(tool.slug)}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={`block px-2 py-2 text-sm transition-colors ${
                          isCurrent
                            ? 'bg-signal-soft font-medium text-signal'
                            : 'text-ink hover:bg-paper'
                        }`}
                      >
                        {tool.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
