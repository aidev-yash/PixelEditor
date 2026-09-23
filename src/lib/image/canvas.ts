import { ImageError } from './types';

/**
 * Canvas helpers that work identically on the main thread and inside a Web
 * Worker. Everything downstream draws through these two functions so the
 * pipeline never needs to know where it is running.
 */

export type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;

export function hasOffscreenCanvas(): boolean {
  return typeof OffscreenCanvas !== 'undefined';
}

function isOffscreen(canvas: AnyCanvas): canvas is OffscreenCanvas {
  return typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas;
}

export function createCanvas(width: number, height: number): AnyCanvas {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));

  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(w, h);
  }
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }
  throw new ImageError('This browser does not provide a canvas to draw on.');
}

/**
 * The two 2D context interfaces are structurally identical for everything we
 * use, but TypeScript will not let you call a method on the union. Casting at
 * this single boundary keeps every call site readable.
 */
export function get2d(canvas: AnyCanvas): CanvasRenderingContext2D {
  const ctx = isOffscreen(canvas) ? canvas.getContext('2d') : canvas.getContext('2d');
  if (!ctx) {
    throw new ImageError('The browser refused a 2D drawing context, usually because the image is too large.');
  }
  return ctx as unknown as CanvasRenderingContext2D;
}

export function highQuality(ctx: CanvasRenderingContext2D): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

export async function canvasToBlob(
  canvas: AnyCanvas,
  type: string,
  quality?: number,
): Promise<Blob> {
  if (isOffscreen(canvas)) {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new ImageError('The browser could not encode this image.'));
      },
      type,
      quality,
    );
  });
}

/** Frees the backing store of a temporary canvas as early as possible. */
export function releaseCanvas(canvas: AnyCanvas): void {
  try {
    canvas.width = 1;
    canvas.height = 1;
  } catch {
    /* nothing to do */
  }
}
