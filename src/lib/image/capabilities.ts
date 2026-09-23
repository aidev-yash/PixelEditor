import { canvasToBlob, createCanvas, get2d } from './canvas';

/**
 * Runtime encoder detection. A browser that cannot encode WebP or AVIF will
 * quietly hand back a PNG from toBlob() instead of failing, so the only
 * reliable test is to encode a tiny image and read the MIME type that comes
 * back. Results are cached for the life of the page.
 *
 * Nothing in the UI advertises a format until this has confirmed it.
 */

const cache = new Map<string, Promise<boolean>>();

async function probe(type: string): Promise<boolean> {
  try {
    const canvas = createCanvas(8, 8);
    const ctx = get2d(canvas);
    // A flat fill is enough; some encoders reject fully empty surfaces.
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 8, 8);
    const blob = await canvasToBlob(canvas, type, 0.8);
    return blob.type === type && blob.size > 0;
  } catch {
    return false;
  }
}

export function canEncode(type: string): Promise<boolean> {
  const existing = cache.get(type);
  if (existing) return existing;
  const result = probe(type);
  cache.set(type, result);
  return result;
}

export interface EncoderSupport {
  jpeg: boolean;
  png: boolean;
  webp: boolean;
  avif: boolean;
}

let supportPromise: Promise<EncoderSupport> | null = null;

export function detectEncoderSupport(): Promise<EncoderSupport> {
  if (!supportPromise) {
    supportPromise = (async () => {
      const [jpeg, png, webp, avif] = await Promise.all([
        canEncode('image/jpeg'),
        canEncode('image/png'),
        canEncode('image/webp'),
        canEncode('image/avif'),
      ]);
      return { jpeg, png, webp, avif };
    })();
  }
  return supportPromise;
}

/** Workers are only used when they can actually draw, which needs OffscreenCanvas. */
export function canUseWorker(): boolean {
  return (
    typeof Worker !== 'undefined' &&
    typeof OffscreenCanvas !== 'undefined' &&
    typeof createImageBitmap !== 'undefined'
  );
}
