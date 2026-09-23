export function ErrorNotice({
  message,
  detail,
  onDismiss,
}: {
  message: string;
  detail?: string;
  onDismiss?: () => void;
}) {
  return (
    <div role="alert" className="flex gap-3 border border-danger bg-danger-soft px-4 py-3">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-danger">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-danger">{message}</p>
        {detail ? <p className="mt-1 text-xs text-ink-muted">{detail}</p> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 self-start font-mono text-xs text-ink-muted hover:text-ink"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}

/** Non-blocking caution note — used when a result is usable but imperfect. */
export function CautionNotice({ message }: { message: string }) {
  return (
    <p className="border-l-2 border-caution bg-caution-soft px-3 py-2 text-xs text-ink">
      {message}
    </p>
  );
}
