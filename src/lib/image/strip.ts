import { ImageError } from './types';

/**
 * Lossless metadata removal.
 *
 * Re-encoding a JPEG to drop its EXIF block also re-compresses every pixel and
 * loses quality. These functions instead walk the container and rewrite it
 * without the metadata segments, so the compressed image data is copied byte
 * for byte and the picture is mathematically identical.
 */

export interface StripResult {
  data: Uint8Array;
  /** Human-readable names of what was taken out, shown in the UI. */
  removed: string[];
  bytesRemoved: number;
  format: 'JPEG' | 'PNG' | 'WebP';
}

export interface StripOptions {
  /** ICC profiles describe colour, not the photographer. Kept by default. */
  keepColourProfile: boolean;
}

function concat(parts: Uint8Array[], totalLength: number): Uint8Array {
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function readIdentifier(bytes: Uint8Array, start: number, end: number): string {
  const limit = Math.min(end, start + 24);
  let text = '';
  for (let i = start; i < limit; i += 1) {
    const code = bytes[i];
    if (code === 0) break;
    if (code < 32 || code > 126) break;
    text += String.fromCharCode(code);
  }
  return text;
}

function labelForJpegSegment(marker: number, identifier: string): string {
  if (marker === 0xfe) return 'JPEG comment';
  const app = marker - 0xe0;
  if (marker === 0xe1) {
    if (identifier.startsWith('Exif')) return 'EXIF block (camera, timestamps, GPS)';
    if (identifier.startsWith('http://ns.adobe.com/xap')) return 'XMP metadata';
    return 'APP1 metadata';
  }
  if (marker === 0xe2 && identifier.startsWith('ICC_PROFILE')) return 'ICC colour profile';
  if (marker === 0xed && identifier.startsWith('Photoshop')) return 'IPTC / Photoshop data';
  if (marker === 0xe0) return 'JFIF extension';
  return `APP${app} application data`;
}

function stripJpeg(bytes: Uint8Array, options: StripOptions): StripResult {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new ImageError('This file does not start with a JPEG header.');
  }

  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  const removed: string[] = [];
  let kept = 2;
  let bytesRemoved = 0;
  let index = 2;

  while (index < bytes.length - 1) {
    if (bytes[index] !== 0xff) {
      // Unexpected byte: copy the remainder untouched rather than risk
      // corrupting the file.
      const rest = bytes.subarray(index);
      parts.push(rest);
      kept += rest.length;
      index = bytes.length;
      break;
    }

    // 0xFF may be repeated as padding before the marker byte.
    let markerIndex = index + 1;
    while (markerIndex < bytes.length && bytes[markerIndex] === 0xff) markerIndex += 1;
    if (markerIndex >= bytes.length) {
      const rest = bytes.subarray(index);
      parts.push(rest);
      kept += rest.length;
      break;
    }

    const marker = bytes[markerIndex];

    // Standalone markers carry no payload.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      const chunk = bytes.subarray(index, markerIndex + 1);
      parts.push(chunk);
      kept += chunk.length;
      index = markerIndex + 1;
      continue;
    }

    // Start of scan or end of image: everything after this is entropy-coded
    // pixel data and is copied verbatim.
    if (marker === 0xda || marker === 0xd9) {
      const rest = bytes.subarray(index);
      parts.push(rest);
      kept += rest.length;
      index = bytes.length;
      break;
    }

    if (markerIndex + 2 >= bytes.length) {
      const rest = bytes.subarray(index);
      parts.push(rest);
      kept += rest.length;
      break;
    }

    const length = (bytes[markerIndex + 1] << 8) | bytes[markerIndex + 2];
    const segmentEnd = markerIndex + 1 + length;
    if (length < 2 || segmentEnd > bytes.length) {
      const rest = bytes.subarray(index);
      parts.push(rest);
      kept += rest.length;
      break;
    }

    const isApplication = marker >= 0xe0 && marker <= 0xef;
    const isComment = marker === 0xfe;

    if (isApplication || isComment) {
      const identifier = readIdentifier(bytes, markerIndex + 3, segmentEnd);
      const keepSegment =
        (marker === 0xe0 && (identifier.startsWith('JFIF') || identifier.startsWith('JFXX'))) ||
        (marker === 0xe2 && identifier.startsWith('ICC_PROFILE') && options.keepColourProfile) ||
        // APP14 'Adobe' records the colour transform; dropping it can change
        // how the image decodes, and it holds nothing personal.
        (marker === 0xee && identifier.startsWith('Adobe'));

      if (!keepSegment) {
        removed.push(labelForJpegSegment(marker, identifier));
        bytesRemoved += segmentEnd - index;
        index = segmentEnd;
        continue;
      }
    }

    const chunk = bytes.subarray(index, segmentEnd);
    parts.push(chunk);
    kept += chunk.length;
    index = segmentEnd;
  }

  return { data: concat(parts, kept), removed, bytesRemoved, format: 'JPEG' };
}

const PNG_ALWAYS_KEEP = new Set([
  'IHDR',
  'PLTE',
  'IDAT',
  'IEND',
  'tRNS',
  'gAMA',
  'cHRM',
  'sRGB',
  'sBIT',
  'bKGD',
  'pHYs',
  'acTL',
  'fcTL',
  'fdAT',
]);

const PNG_LABELS: Record<string, string> = {
  tEXt: 'Text comment (tEXt)',
  zTXt: 'Compressed text comment (zTXt)',
  iTXt: 'International text / XMP (iTXt)',
  eXIf: 'EXIF block (eXIf)',
  tIME: 'Last-modified timestamp (tIME)',
  iCCP: 'ICC colour profile (iCCP)',
};

function stripPng(bytes: Uint8Array, options: StripOptions): StripResult {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 12 || !signature.every((b, i) => bytes[i] === b)) {
    throw new ImageError('This file does not start with a PNG header.');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  const removed: string[] = [];
  let kept = 8;
  let bytesRemoved = 0;
  let index = 8;

  while (index + 8 <= bytes.length) {
    const length = view.getUint32(index);
    const type = String.fromCharCode(
      bytes[index + 4],
      bytes[index + 5],
      bytes[index + 6],
      bytes[index + 7],
    );
    const chunkEnd = index + 12 + length;
    if (chunkEnd > bytes.length) break;

    // An uppercase first letter marks a critical chunk the decoder needs.
    const isCritical = type.charCodeAt(0) >= 65 && type.charCodeAt(0) <= 90;
    const keepChunk =
      PNG_ALWAYS_KEEP.has(type) || (type === 'iCCP' && options.keepColourProfile) || isCritical;

    if (keepChunk) {
      const chunk = bytes.subarray(index, chunkEnd);
      parts.push(chunk);
      kept += chunk.length;
    } else {
      removed.push(PNG_LABELS[type] ?? `Ancillary chunk (${type})`);
      bytesRemoved += chunkEnd - index;
    }

    index = chunkEnd;
    if (type === 'IEND') break;
  }

  return { data: concat(parts, kept), removed, bytesRemoved, format: 'PNG' };
}

function stripWebp(bytes: Uint8Array, options: StripOptions): StripResult {
  const fourcc = (offset: number) =>
    String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);

  if (bytes.length < 16 || fourcc(0) !== 'RIFF' || fourcc(8) !== 'WEBP') {
    throw new ImageError('This file does not look like a WebP container.');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const body: Uint8Array[] = [];
  const removed: string[] = [];
  let bodyLength = 0;
  let bytesRemoved = 0;
  let index = 12;

  while (index + 8 <= bytes.length) {
    const type = fourcc(index);
    const size = view.getUint32(index + 4, true);
    const padded = size + (size % 2);
    const chunkEnd = index + 8 + padded;
    if (chunkEnd > bytes.length) break;

    const isMetadata =
      type === 'EXIF' || type === 'XMP ' || (type === 'ICCP' && !options.keepColourProfile);

    if (isMetadata) {
      removed.push(
        type === 'EXIF'
          ? 'EXIF block (camera, timestamps, GPS)'
          : type === 'XMP '
            ? 'XMP metadata'
            : 'ICC colour profile',
      );
      bytesRemoved += chunkEnd - index;
    } else {
      const chunk = bytes.slice(index, chunkEnd);
      if (type === 'VP8X') {
        // Clear the EXIF (0x08) and XMP (0x04) flags so decoders stop looking
        // for blocks that are no longer there.
        chunk[8] &= ~0x0c;
        if (!options.keepColourProfile) chunk[8] &= ~0x20;
      }
      body.push(chunk);
      bodyLength += chunk.length;
    }

    index = chunkEnd;
  }

  const header = bytes.slice(0, 12);
  const out = concat([header, ...body], 12 + bodyLength);
  // RIFF size counts everything after the 8-byte RIFF header.
  new DataView(out.buffer).setUint32(4, out.length - 8, true);

  return { data: out, removed, bytesRemoved, format: 'WebP' };
}

export async function stripMetadata(file: Blob, options: StripOptions): Promise<StripResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (bytes[0] === 0xff && bytes[1] === 0xd8) return stripJpeg(bytes, options);
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return stripPng(bytes, options);
  if (
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === 'RIFF' &&
    String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === 'WEBP'
  ) {
    return stripWebp(bytes, options);
  }

  throw new ImageError(
    'Lossless metadata removal works on JPG, PNG and WebP files. This file is something else.',
  );
}
