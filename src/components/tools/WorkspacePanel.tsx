import type { ReactNode } from 'react';

/**
 * The bordered frame every tool workspace sits in. Keeps the "instrument"
 * look consistent across fourteen pages without each tool re-deciding it.
 */
export function WorkspacePanel({
  label,
  status,
  children,
  footer,
}: {
  label: string;
  status?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section
      aria-label={label}
      className="border border-instrument bg-surface shadow-[0_1px_0_rgba(15,20,25,0.04)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3">
        <p className="font-mono text-2xs uppercase tracking-wider text-ink-muted">{label}</p>
        {status ? <div className="flex items-center gap-3">{status}</div> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      {footer ? <div className="border-t border-rule px-4 py-3 sm:px-5">{footer}</div> : null}
    </section>
  );
}

/** Small green badge stating where the work happens. Used in panel headers. */
export function LocalBadge({ label = 'Processing on this device' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-local-soft px-2 py-1 font-mono text-2xs uppercase tracking-wider text-local">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-local" />
      {label}
    </span>
  );
}

/** Two-column layout: controls on the left, preview on the right. */
export function WorkspaceSplit({
  controls,
  preview,
}: {
  controls: ReactNode;
  preview: ReactNode;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-6">
      <div className="space-y-5">{controls}</div>
      <div className="min-w-0">{preview}</div>
    </div>
  );
}

/** Groups a set of related controls under a small heading. */
export function ControlGroup({
  title,
  children,
  hint,
}: {
  title: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">{title}</p>
      {children}
      {hint ? <p className="mt-2 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
