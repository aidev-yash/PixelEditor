import { ImageError } from './types';

/**
 * Decoding and format sniffing. Everything here reads bytes that are already
 * in memory on the visitor's device — no request is made.
 */

export interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** Releases the bitmap or object URL. Always call it. */
  close: () => void;
}

/** Reads the real format from the file header rather than trusting the extension. */
export async function sniffType(blob: Blob): Promise<string | null> {
  const header = new Uint8Array(await blob.slice(0, 32).arrayBuffer());
  if (header.length < 4) return null;

  const startsWith = (...bytes: number[]) => bytes.every((b, i) => header[i] === b);
  const ascii = (offset: number, length: number) =>
    Array.from(header.slice(offset, offset + length))
      .map((c) => String.fromCharCode(c))
      .join('');

  if (startsWith(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (startsWith(0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  if (startsWith(0x42, 0x4d)) return 'image/bmp';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'image/webp';
  if (ascii(4, 4) === 'ftyp') {
    const brand = ascii(8, 4);
    if (brand === 'avif' || brand === 'avis') return 'image/avif';
    if (brand === 'heic' || brand === 'heix' || brand === 'mif1' || brand === 'msf1') {
      return 'image/heic';
    }
  }
  if (startsWith(0x00, 0x00, 0x01, 0x00)) return 'image/x-icon';
  const text = ascii(0, 5).toLowerCase();
  if (text === '<?xml' || text.startsWith('<svg')) return 'image/svg+xml';
  return null;
}

/**
 * Best-effort alpha detection from the container, which is cheap and exact for
 * the formats that can carry transparency. Returns null when it cannot tell.
 */
export async function probeAlpha(blob: Blob, type: string | null): Promise<boolean | null> {
  try {
    if (type === 'image/jpeg' || type === 'image/bmp') return false;

    if (type === 'image/png') {
      const head = new Uint8Array(await blob.slice(0, 26).arrayBuffer());
      // IHDR colour type sits at byte 25: 4 = grey+alpha, 6 = RGBA.
      const colourType = head[25];
      if (colourType === 4 || colourType === 6) return true;
      // A tRNS chunk can add transparency to indexed or truecolour PNGs.
      const sample = new Uint8Array(await blob.slice(0, 4096).arrayBuffer());
      const marker = [0x74, 0x52, 0x4e, 0x53]; // 'tRNS'
      for (let i = 0; i < sample.length - 4; i += 1) {
        if (marker.every((b, k) => sample[i + k] === b)) return true;
      }
      return false;
    }

    if (type === 'image/webp') {
      const sample = new Uint8Array(await blob.slice(0, 64).arrayBuffer());
      const fourcc = (offset: number) =>
        Array.from(sample.slice(offset, offset + 4))
          .map((c) => String.fromCharCode(c))
          .join('');
      if (fourcc(12) === 'VP8X') {
        // Flags byte: bit 0x10 marks an alpha channel.
        return (sample[20] & 0x10) !== 0;
      }
      if (fourcc(12) === 'VP8L') {
        // Lossless WebP stores an alpha hint in bit 3 of byte 24.
        return (sample[24] & 0x08) !== 0;
      }
      return false;
    }

    if (type === 'image/gif') return true;
    return null;
  } catch {
    return null;
  }
}

/** Decodes a blob into something drawable, with a fallback for older Safari. */
export async function decodeImage(blob: Blob): Promise<DecodedImage> {
  if (blob.size === 0) {
    throw new ImageError('That file is empty (0 bytes), so there is nothing to read.');
  }

  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // Older engines reject the options object; retry without it before
      // falling through to the <img> path.
      try {
        const bitmap = await createImageBitmap(blob);
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          close: () => bitmap.close(),
        };
      } catch {
        /* fall through */
      }
    }
  }

  if (typeof document === 'undefined') {
    throw new ImageError('This browser could not decode the image.');
  }

  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new ImageError('The browser could not read this file as an image.'));
      element.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight) {
      throw new ImageError('This file decoded to 0×0, so it is not a readable image.');
    }
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
