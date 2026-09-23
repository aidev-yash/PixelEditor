import { runProcess } from '../image/pipeline';
import type { ProcessRequest } from '../image/types';

/**
 * Worker entry point. Decoding, scaling and encoding all happen here so the
 * main thread stays responsive while a 40-megapixel photo is being re-encoded
 * or a batch of thirty files is grinding through.
 *
 * `self` is cast rather than typed with the webworker lib, because pulling
 * that lib into the project collides with the DOM types the rest of the app
 * relies on.
 */

interface WorkerRequest {
  id: number;
  request: ProcessRequest;
}

const ctx = self as unknown as {
  postMessage: (message: unknown) => void;
  addEventListener: (type: 'message', listener: (event: MessageEvent) => void) => void;
};

ctx.addEventListener('message', (event: MessageEvent) => {
  const data = event.data as WorkerRequest;
  if (!data || typeof data.id !== 'number') return;

  runProcess(data.request).then(
    (result) => {
      ctx.postMessage({ id: data.id, ok: true, result });
    },
    (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'This image could not be processed.';
      ctx.postMessage({ id: data.id, ok: false, message });
    },
  );
});
