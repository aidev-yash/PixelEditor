/** Shared types for the image pipeline. Safe to import from a worker. */

export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

/** 'source' keeps whatever format the input already was. */
export type TargetFormat = OutputFormat | 'source';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ResizeMode = 'none' | 'exact' | 'fit' | 'percent';

export interface ResizeSpec {
  mode: ResizeMode;
  /** Used by 'exact' and 'fit'. */
  width?: number;
  height?: number;
  /** Used by 'percent'. 100 = unchanged. */
  percent?: number;
  /** When true, an image already smaller than the box is left alone. */
  noUpscale?: boolean;
}

export interface ProcessRequest {
  file: Blob;
  /** Original filename, echoed back so batch rows stay matched up. */
  name: string;
  format: TargetFormat;
  /** 0.01–1. Ignored for PNG and for lossless WebP. */
  quality: number;
  resize?: ResizeSpec;
  crop?: CropRect;
  rotate?: 0 | 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  /** Fill colour used when an image with alpha is written to JPEG. */
  background?: string;
  /** When set, the encoder searches for a quality that lands at or under this. */
  targetBytes?: number;
  /** Allow the target search to reduce dimensions if quality alone is not enough. */
  allowDownscale?: boolean;
  /** Write WebP losslessly (quality 1 triggers lossless in browser encoders). */
  lossless?: boolean;
}

export interface ProcessResult {
  name: string;
  blob: Blob;
  type: string;
  bytes: number;
  width: number;
  height: number;
  sourceBytes: number;
  sourceWidth: number;
  sourceHeight: number;
  /** Final encoder quality actually used, when the format is lossy. */
  quality?: number;
  /** False when a target size was requested but could not be reached. */
  targetMet?: boolean;
  /** True when the target search had to reduce the pixel dimensions. */
  downscaled?: boolean;
}

export interface ImageFacts {
  width: number;
  height: number;
  bytes: number;
  /** MIME type reported by the browser for the File object. */
  reportedType: string;
  /** MIME type sniffed from the first bytes of the file. */
  detectedType: string | null;
  hasAlpha: boolean | null;
}

export class ImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageError';
  }
}
