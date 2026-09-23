import { releaseCanvas } from './canvas';
import { decodeImage, probeAlpha, sniffType } from './decode';
import { encode, encodeToTarget, isLossy, resolveSourceFormat } from './encode';
import { applyOrientation, computeTargetSize, drawResized, normaliseCrop } from './resize';
import { ImageError, type ImageFacts, type ProcessRequest, type ProcessResult } from './types';

/**
 * The single processing entry point. It runs unchanged on the main thread and
 * inside the Web Worker, because every canvas call goes through the helpers in
 * canvas.ts. No part of this file touches the network.
 */

/** Beyond this the browser tends to fail allocation rather than return a canvas. */
const MAX_PIXELS = 100_000_000;

export async function inspect(file: Blob): Promise<ImageFacts> {
  const detectedType = await sniffType(file);
  const decoded = await decodeImage(file);
  try {
    return {
      width: decoded.width,
      height: decoded.height,
      bytes: file.size,
      reportedType: file.type || '',
      detectedType,
      hasAlpha: await probeAlpha(file, detectedType),
    };
  } finally {
    decoded.close();
  }
}

export async function runProcess(request: ProcessRequest): Promise<ProcessResult> {
  const decoded = await decodeImage(request.file);

  try {
    const sourceWidth = decoded.width;
    const sourceHeight = decoded.height;

    if (sourceWidth * sourceHeight > MAX_PIXELS) {
      throw new ImageError(
        'This image is larger than 100 megapixels, which is more than a browser canvas can hold. Try a smaller copy.',
      );
    }

    const crop = normaliseCrop(request.crop, sourceWidth, sourceHeight);
    const detectedType = await sniffType(request.file);
    const format =
      request.format === 'source'
        ? resolveSourceFormat(detectedType ?? request.file.type)
        : request.format;

    // JPEG has no alpha channel, so transparent pixels must be flattened onto
    // a solid colour or they come out black.
    const background = format === 'image/jpeg' ? request.background || '#ffffff' : undefined;

    const base = computeTargetSize(crop.width, crop.height, request.resize);
    let width = base.width;
    let height = base.height;
    let downscaled = false;
    let attempt = 0;

    for (;;) {
      const resizedCanvas = drawResized(decoded.source, crop, width, height, background);
      const canvas = applyOrientation(
        resizedCanvas,
        {
          rotate: request.rotate,
          flipHorizontal: request.flipHorizontal,
          flipVertical: request.flipVertical,
        },
        background,
      );

      const outputWidth = canvas.width;
      const outputHeight = canvas.height;

      let blob: Blob;
      let quality: number | undefined;
      let targetMet: boolean | undefined;

      if (request.targetBytes && request.targetBytes > 0) {
        const search = await encodeToTarget(canvas, format, request.targetBytes);
        blob = search.blob;
        quality = search.quality;
        targetMet = search.met;
      } else {
        blob = await encode(canvas, format, request.quality, request.lossless);
        quality = isLossy(format) ? request.quality : undefined;
      }

      releaseCanvas(canvas);

      const giveUp =
        targetMet !== false ||
        !request.allowDownscale ||
        attempt >= 4 ||
        (outputWidth <= 64 && outputHeight <= 64);

      if (giveUp) {
        return {
          name: request.name,
          blob,
          type: blob.type,
          bytes: blob.size,
          width: outputWidth,
          height: outputHeight,
          sourceBytes: request.file.size,
          sourceWidth,
          sourceHeight,
          quality,
          targetMet,
          downscaled,
        };
      }

      // The byte target could not be reached by quality alone, and the caller
      // allowed shrinking, so step the dimensions down and try again.
      attempt += 1;
      downscaled = true;
      width = Math.max(32, Math.round(width * 0.8));
      height = Math.max(32, Math.round(height * 0.8));
    }
  } finally {
    decoded.close();
  }
}
