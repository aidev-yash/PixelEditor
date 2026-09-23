import { type AnyCanvas, canvasToBlob } from './canvas';
import { ImageError, type OutputFormat } from './types';

/** Encoding, including the quality search used by target-size mode. */

export const FORMAT_EXTENSION: Record<OutputFormat, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export const FORMAT_LABEL: Record<OutputFormat, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
};

/** PNG ignores the quality argument entirely; the UI hides it accordingly. */
export function isLossy(format: OutputFormat): boolean {
  return format !== 'image/png';
}

export async function encode(
  canvas: AnyCanvas,
  format: OutputFormat,
  quality: number,
  lossless = false,
): Promise<Blob> {
  // Browser WebP encoders treat quality 1 as lossless; JPEG/AVIF have no
  // lossless mode here, so the flag only applies to WebP.
  const effectiveQuality =
    format === 'image/webp' && lossless ? 1 : Math.min(1, Math.max(0.01, quality));

  const blob = await canvasToBlob(canvas, format, isLossy(format) ? effectiveQuality : undefined);

  if (blob.type !== format) {
    throw new ImageError(
      `This browser cannot write ${FORMAT_LABEL[format]} files. Pick a different output format.`,
    );
  }
  return blob;
}

export interface TargetSearchResult {
  blob: Blob;
  quality: number;
  met: boolean;
  /** Number of encode passes the search actually ran, shown in the readout. */
  passes: number;
}

/**
 * Finds the highest quality that still fits inside a byte budget.
 *
 * File size is monotonic in quality for every browser encoder we target, so a
 * binary search converges in a handful of passes. If even the lowest quality
 * overshoots, the smallest result is returned with met: false — the UI says so
 * rather than pretending the target was hit.
 */
export async function encodeToTarget(
  canvas: AnyCanvas,
  format: OutputFormat,
  targetBytes: number,
  maxPasses = 7,
): Promise<TargetSearchResult> {
  if (!isLossy(format)) {
    const blob = await encode(canvas, format, 1);
    return { blob, quality: 1, met: blob.size <= targetBytes, passes: 1 };
  }

  const ceiling = 0.92;
  const floor = 0.05;
  let passes = 0;

  const high = await encode(canvas, format, ceiling);
  passes += 1;
  if (high.size <= targetBytes) {
    return { blob: high, quality: ceiling, met: true, passes };
  }

  const low = await encode(canvas, format, floor);
  passes += 1;
  if (low.size > targetBytes) {
    return { blob: low, quality: floor, met: false, passes };
  }

  let lo = floor;
  let hi = ceiling;
  let best = { blob: low, quality: floor };

  while (passes < maxPasses && hi - lo > 0.01) {
    const mid = (lo + hi) / 2;
    const candidate = await encode(canvas, format, mid);
    passes += 1;
    if (candidate.size <= targetBytes) {
      best = { blob: candidate, quality: mid };
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return { blob: best.blob, quality: best.quality, met: true, passes };
}

/** Maps a source MIME type onto a format we can actually write. */
export function resolveSourceFormat(type: string | null | undefined): OutputFormat {
  switch (type) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'image/jpeg';
    case 'image/webp':
      return 'image/webp';
    case 'image/avif':
      return 'image/avif';
    default:
      // GIF, BMP, SVG and anything unrecognised become PNG, which is lossless
      // and universally writable.
      return 'image/png';
  }
}
