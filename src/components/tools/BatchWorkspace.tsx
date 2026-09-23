'use client';

import type { ReactNode } from 'react';
import { ACCEPTED_LABEL } from '@/lib/download';
import { formatBytes } from '@/lib/format';
import { BatchTable } from './BatchTable';
import { Button } from './Button';
import { DropZone } from './DropZone';
import { ErrorNotice } from './ErrorNotice';
import { ProgressBar } from './ProgressBar';
import { ReadoutStrip, type Readout } from './ReadoutStrip';
import { LocalBadge, WorkspacePanel, WorkspaceSplit } from './WorkspacePanel';
import { MAX_BATCH_FILES, type useBatchQueue } from './useBatchQueue';

export type BatchQueue = ReturnType<typeof useBatchQueue>;

interface BatchWorkspaceProps {
  /** Accessible name of the whole workspace. */
  label: string;
  /** Wording for the empty state, e.g. 'Drop images to resize'. */
  dropLabel: string;
  dropHint?: string;
  /** Text on the run button when the queue is idle. */
  runLabel: string;
  /** Filename for the packaged download. */
  zipName: string;
  /** Called when the run button is pressed. */
  onRun: () => void;
  /** True when the current settings cannot produce a valid job. */
  runDisabled?: boolean;
  queue: BatchQueue;
  /** The tool's own settings. */
  controls: ReactNode;
  /** Extra readout tiles shown above the split. */
  readouts?: Readout[];
  /** Notices shown under the table — format warnings and the like. */
  notes?: ReactNode;
}

export function BatchWorkspace({
  label,
  dropLabel,
  dropHint,
  runLabel,
  zipName,
  onRun,
  runDisabled = false,
  queue,
  controls,
  readouts,
  notes,
}: BatchWorkspaceProps) {
  const { rows, stats, running, zipping, error, setError, add, remove, clear, cancel, downloadZip } =
    queue;

  const empty = stats.total === 0;
  const saved = stats.sourceBytes - stats.outputBytes;

  return (
    <WorkspacePanel
      label={label}
      status={
        <>
          <LocalBadge label="Queued and processed on this device" />
          {!empty ? (
            <Button variant="ghost" onClick={clear} disabled={running} className="px-2 py-1">
              Clear list
            </Button>
          ) : null}
        </>
      }
      footer={
        empty ? undefined : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">
              {stats.done > 0
                ? `${stats.done} of ${stats.total} finished${
                    stats.failed > 0 ? ` · ${stats.failed} failed` : ''
                  }${saved > 0 ? ` · ${formatBytes(saved)} smaller in total` : ''}`
                : `${stats.total} ${stats.total === 1 ? 'file' : 'files'} queued. Nothing has been sent anywhere.`}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {running ? (
                <Button variant="danger" onClick={cancel}>
                  Stop
                </Button>
              ) : (
                <Button variant="primary" onClick={onRun} disabled={runDisabled || stats.total === 0}>
                  {stats.done > 0 && stats.pending === 0 ? 'Run again' : runLabel}
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => void downloadZip(zipName)}
                disabled={stats.done === 0 || zipping || running}
              >
                {zipping ? 'Packaging…' : `Download ${stats.done > 0 ? stats.done : ''} as ZIP`}
              </Button>
            </div>
          </div>
        )
      }
    >
      {empty ? (
        <div className="space-y-4">
          <DropZone
            multiple
            onFiles={add}
            label={dropLabel}
            hint={
              dropHint ??
              `${ACCEPTED_LABEL}. Up to ${MAX_BATCH_FILES} files at a time, handled one after another in this tab.`
            }
          />
          {error ? <ErrorNotice message={error} onDismiss={() => setError(null)} /> : null}
        </div>
      ) : (
        <div className="space-y-5">
          {readouts && readouts.length > 0 ? (
            <ReadoutStrip items={readouts} live caption="Totals for the files that finished" />
          ) : null}

          {error ? <ErrorNotice message={error} onDismiss={() => setError(null)} /> : null}

          <WorkspaceSplit
            controls={
              <>
                {controls}
                <DropZone
                  compact
                  multiple
                  onFiles={add}
                  label="Add more files"
                  hint={`Appended to the queue. ${MAX_BATCH_FILES} files is the cap for one run.`}
                  disabled={running}
                />
              </>
            }
            preview={
              <div className="space-y-4">
                {running || stats.done > 0 || stats.failed > 0 ? (
                  <ProgressBar
                    value={stats.percent}
                    label={running ? 'Processing' : 'Finished'}
                    detail={
                      running
                        ? `${stats.done + stats.failed} of ${stats.total} handled · ${stats.pending} to go`
                        : `${stats.done} finished${stats.failed > 0 ? `, ${stats.failed} failed` : ''}`
                    }
                  />
                ) : null}

                <BatchTable rows={rows} onRemove={remove} busy={running} />

                {notes}
              </div>
            }
          />
        </div>
      )}
    </WorkspacePanel>
  );
}
