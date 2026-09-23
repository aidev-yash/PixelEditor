import { type AnyCanvas, createCanvas, get2d, highQuality, releaseCanvas } from './canvas';
import type { CropRect, ResizeSpec } from './types';

/** Geometry: target size, high-quality downscaling, rotation and mirroring. */

export function computeTargetSize(
  sourceWidth: number,
  sourceHeight: number,
  spec?: ResizeSpec,
): { width: number; height: number } {
  const source = { width: sourceWidth, height: sourceHeight };
  if (!spec || spec.mode === 'none') return source;

  const ratio = sourceWidth / sourceHeight;

  if (spec.mode === 'percent') {
    const percent = spec.percent && spec.percent > 0 ? spec.percent : 100;
    return {
      width: Math.max(1, Math.round((sourceWidth * percent) / 100)),
      height: Math.max(1, Math.round((sourceHeight * percent) / 100)),
    };
  }

  if (spec.mode === 'exact') {
    const width = spec.width && spec.width > 0 ? Math.round(spec.width) : 0;
    const height = spec.height && spec.height > 0 ? Math.round(spec.height) : 0;
    if (width && height) return { width, height };
    if (width) return { width, height: Math.max(1, Math.round(width / ratio)) };
    if (height) return { width: Math.max(1, Math.round(height * ratio)), height };
    return source;
  }

  // 'fit': the largest size that fits inside the box, ratio preserved.
  const boxWidth = spec.width && spec.width > 0 ? spec.width : Infinity;
  const boxHeight = spec.height && spec.height > 0 ? spec.height : Infinity;
  if (boxWidth === Infinity && boxHeight === Infinity) return source;

  let scale = Math.min(boxWidth / sourceWidth, boxHeight / sourceHeight);
  if (spec.noUpscale !== false) {
    scale = Math.min(scale, 1);
  }
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

/** Clamps a crop rectangle to the image so a bad value can never throw. */
export function normaliseCrop(
  crop: CropRect | undefined,
  width: number,
  height: number,
): CropRect {
  if (!crop) return { x: 0, y: 0, width, height };
  const x = Math.min(Math.max(0, Math.round(crop.x)), Math.max(0, width - 1));
  const y = Math.min(Math.max(0, Math.round(crop.y)), Math.max(0, height - 1));
  const w = Math.min(Math.max(1, Math.round(crop.width)), width - x);
  const h = Math.min(Math.max(1, Math.round(crop.height)), height - y);
  return { x, y, width: w, height: h };
}

/**
 * Draws a source rectangle at a target size. Browsers produce visibly soft,
 * aliased results when a large photo is scaled down in one step, so anything
 * beyond a 2× reduction is halved repeatedly first — the standard technique,
 * and the reason a 4000px photo still looks sharp at 400px.
 */
export function drawResized(
  source: CanvasImageSource,
  crop: CropRect,
  targetWidth: number,
  targetHeight: number,
  background?: string,
): AnyCanvas {
  const dw = Math.max(1, Math.round(targetWidth));
  const dh = Math.max(1, Math.round(targetHeight));

  const needsSteps = crop.width / 2 > dw && crop.height / 2 > dh;

  if (!needsSteps) {
    const canvas = createCanvas(dw, dh);
    const ctx = get2d(canvas);
    highQuality(ctx);
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, dw, dh);
    }
    ctx.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, dw, dh);
    return canvas;
  }

  let currentWidth = Math.max(dw, Math.round(crop.width / 2));
  let currentHeight = Math.max(dh, Math.round(crop.height / 2));
  let canvas = createCanvas(currentWidth, currentHeight);
  const firstCtx = get2d(canvas);
  highQuality(firstCtx);
  firstCtx.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, currentWidth, currentHeight);

  while (currentWidth / 2 > dw && currentHeight / 2 > dh) {
    const nextWidth = Math.max(dw, Math.round(currentWidth / 2));
    const nextHeight = Math.max(dh, Math.round(currentHeight / 2));
    const next = createCanvas(nextWidth, nextHeight);
    const nextCtx = get2d(next);
    highQuality(nextCtx);
    nextCtx.drawImage(canvas, 0, 0, currentWidth, currentHeight, 0, 0, nextWidth, nextHeight);
    releaseCanvas(canvas);
    canvas = next;
    currentWidth = nextWidth;
    currentHeight = nextHeight;
  }

  if (currentWidth !== dw || currentHeight !== dh || background) {
    const out = createCanvas(dw, dh);
    const outCtx = get2d(out);
    highQuality(outCtx);
    if (background) {
      outCtx.fillStyle = background;
      outCtx.fillRect(0, 0, dw, dh);
    }
    outCtx.drawImage(canvas, 0, 0, currentWidth, currentHeight, 0, 0, dw, dh);
    releaseCanvas(canvas);
    return out;
  }

  return canvas;
}

export interface Orientation {
  rotate?: 0 | 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

export function isIdentityOrientation(orientation: Orientation): boolean {
  return (
    !orientation.rotate &&
    !orientation.flipHorizontal &&
    !orientation.flipVertical
  );
}

/**
 * Bakes rotation and mirroring into the pixels. Nothing here writes an EXIF
 * orientation tag, so the result looks the same in every viewer.
 */
export function applyOrientation(
  input: AnyCanvas,
  orientation: Orientation,
  background?: string,
): AnyCanvas {
  if (isIdentityOrientation(orientation)) return input;

  const rotate = orientation.rotate ?? 0;
  const swap = rotate === 90 || rotate === 270;
  const width = input.width;
  const height = input.height;
  const outWidth = swap ? height : width;
  const outHeight = swap ? width : height;

  const out = createCanvas(outWidth, outHeight);
  const ctx = get2d(out);
  highQuality(ctx);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, outWidth, outHeight);
  }

  ctx.translate(outWidth / 2, outHeight / 2);
  if (rotate) ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(orientation.flipHorizontal ? -1 : 1, orientation.flipVertical ? -1 : 1);
  ctx.drawImage(input, -width / 2, -height / 2, width, height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  releaseCanvas(input);
  return out;
}
