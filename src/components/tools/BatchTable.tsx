'use client';

import { formatBytes, formatDelta } from '@/lib/format';

export type BatchStatus = 'queued' | 'working' | 'done' | 'error' | 'skipped';

export interface BatchRow {
  id: string;
  name: string;
  status: BatchStatus;
  sourceBytes: number;
  outputBytes?: number;
  dimensions?: string;
  message?: string;
}

const STATUS_LABEL: Record<BatchStatus, string> = {
  queued: 'Queued',
  working: 'Working',
  done: 'Done',
  error: 'Failed',
  skipped: 'Skipped',
};

const STATUS_CLASS: Record<BatchStatus, string> = {
  queued: 'bg-paper text-ink-muted',
  working: 'bg-signal-soft text-signal',
  done: 'bg-local-soft text-local',
  error: 'bg-danger-soft text-danger',
  skipped: 'bg-caution-soft text-caution',
};

export function BatchTable({
  rows,
  onRemove,
  busy = false,
}: {
  rows: BatchRow[];
  onRemove?: (id: string) => void;
  busy?: boolean;
}) {
  const done = rows.filter((row) => row.status === 'done' && row.outputBytes !== undefined);
  const totalBefore = done.reduce((sum, row) => sum + row.sourceBytes, 0);
  const totalAfter = done.reduce((sum, row) => sum + (row.outputBytes ?? 0), 0);
  const totalDelta = formatDelta(totalBefore, totalAfter);

  return (
    // The wrapper scrolls sideways on narrow screens, so it is a focusable
    // region: without tabIndex a keyboard-only user cannot reach the columns
    // past the fold when the rows contain nothing else focusable.
    <div
      role="region"
      aria-label="Batch results"
      tabIndex={0}
      className="overflow-x-auto border border-rule focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal"
    >
      <table className="w-full min-w-[560px] border-collapse text-left">
        <caption className="sr-only">
          Files in this batch, with their status and resulting size.
        </caption>
        <thead>
          <tr className="border-b border-rule bg-paper">
            <th scope="col" className="px-3 py-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
              File
            </th>
            <th scope="col" className="px-3 py-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
              Status
            </th>
            <th scope="col" className="px-3 py-2 text-right font-mono text-2xs uppercase tracking-wider text-ink-muted">
              Before
            </th>
            <th scope="col" className="px-3 py-2 text-right font-mono text-2xs uppercase tracking-wider text-ink-muted">
              After
            </th>
            <th scope="col" className="px-3 py-2 text-right font-mono text-2xs uppercase tracking-wider text-ink-muted">
              Change
            </th>
            {onRemove ? (
              <th scope="col" className="px-3 py-2">
                <span className="sr-only">Remove</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const delta =
              row.status === 'done' && row.outputBytes !== undefined
                ? formatDelta(row.sourceBytes, row.outputBytes)
                : null;
            const shrank = row.outputBytes !== undefined && row.outputBytes < row.sourceBytes;

            return (
              <tr key={row.id} className="border-b border-rule last:border-b-0">
                <td className="max-w-[260px] px-3 py-2">
                  <span className="block truncate text-sm text-ink" title={row.name}>
                    {row.name}
                  </span>
                  {row.dimensions ? (
                    <span className="tnum font-mono text-2xs text-ink-muted">{row.dimensions}</span>
                  ) : null}
                  {row.message ? (
                    <span
                      className={`block text-2xs ${
                        row.status === 'error' ? 'text-danger' : 'text-caution'
                      }`}
                    >
                      {row.message}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block px-2 py-0.5 font-mono text-2xs uppercase tracking-wider ${STATUS_CLASS[row.status]}`}
                  >
                    {STATUS_LABEL[row.status]}
                  </span>
                </td>
                <td className="tnum px-3 py-2 text-right font-mono text-xs text-ink-muted">
                  {formatBytes(row.sourceBytes)}
                </td>
                <td className="tnum px-3 py-2 text-right font-mono text-xs text-ink">
                  {row.outputBytes !== undefined ? formatBytes(row.outputBytes) : '—'}
                </td>
                <td
                  className={`tnum px-3 py-2 text-right font-mono text-xs ${
                    delta ? (shrank ? 'text-local' : 'text-caution') : 'text-ink-muted'
                  }`}
                >
                  {delta ?? '—'}
                </td>
                {onRemove ? (
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(row.id)}
                      disabled={busy}
                      className="font-mono text-2xs uppercase tracking-wider text-ink-muted hover:text-danger disabled:opacity-40"
                    >
                      Remove
                      <span className="sr-only"> {row.name}</span>
                    </button>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
        {done.length > 1 ? (
          <tfoot>
            <tr className="border-t border-instrument bg-paper">
              <td className="px-3 py-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
                {done.length} finished
              </td>
              <td />
              <td className="tnum px-3 py-2 text-right font-mono text-xs text-ink-muted">
                {formatBytes(totalBefore)}
              </td>
              <td className="tnum px-3 py-2 text-right font-mono text-xs text-ink">
                {formatBytes(totalAfter)}
              </td>
              <td
                className={`tnum px-3 py-2 text-right font-mono text-xs ${
                  totalAfter < totalBefore ? 'text-local' : 'text-caution'
                }`}
              >
                {totalDelta ?? '—'}
              </td>
              {onRemove ? <td /> : null}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
