'use client';

/** Hands a finished blob to the browser's own download mechanism. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Safari needs the URL to outlive the click by a tick.
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** File types every tool accepts on its file input. */
export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif';

export const ACCEPTED_LABEL = 'JPG, PNG, WebP, GIF, BMP and AVIF';

/** Filters a FileList down to things that plausibly are images. */
export function collectImageFiles(list: FileList | null | undefined): File[] {
  if (!list) return [];
  const files: File[] = [];
  for (let i = 0; i < list.length; i += 1) {
    const file = list[i];
    const looksLikeImage =
      file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);
    if (looksLikeImage) files.push(file);
  }
  return files;
}
