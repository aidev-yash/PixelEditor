/** Formatting helpers for the instrument readouts. Pure, no DOM. */

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(2) : mb.toFixed(1)} MB`;
}

/** Kilobytes as a plain number, for the target-size field. */
export function toKb(bytes: number): number {
  return Math.round(bytes / 1024);
}

export function formatDimensions(width: number, height: number): string {
  return `${width}×${height}`;
}

export function formatMegapixels(width: number, height: number): string {
  const mp = (width * height) / 1_000_000;
  if (mp < 0.1) return `${mp.toFixed(2)} MP`;
  return `${mp.toFixed(mp < 10 ? 1 : 0)} MP`;
}

/**
 * Signed change between two byte counts. Negative means the output got
 * smaller. Returns null when there is nothing meaningful to compare.
 */
export function formatDelta(before: number, after: number): string | null {
  if (!before || !after) return null;
  const change = ((after - before) / before) * 100;
  if (Math.abs(change) < 0.05) return '±0%';
  const sign = change < 0 ? '−' : '+';
  const value = Math.abs(change);
  return `${sign}${value < 10 ? value.toFixed(1) : Math.round(value)}%`;
}

/** Greatest common divisor, used for the reduced aspect ratio. */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function formatAspectRatio(width: number, height: number): string {
  if (!width || !height) return '—';
  const divisor = gcd(width, height);
  const w = width / divisor;
  const h = height / divisor;
  // A reduced ratio like 3456:2304 is useless to a reader; fall back to a
  // decimal ratio once the reduced terms get large.
  if (w > 40 || h > 40) {
    return `${(width / height).toFixed(2)}:1`;
  }
  return `${w}:${h}`;
}

/** Common ratio name, when the image happens to match one closely. */
export function commonRatioName(width: number, height: number): string | null {
  if (!width || !height) return null;
  const ratio = width / height;
  const named: [string, number][] = [
    ['Square', 1],
    ['3:2', 3 / 2],
    ['2:3', 2 / 3],
    ['4:3', 4 / 3],
    ['3:4', 3 / 4],
    ['16:9', 16 / 9],
    ['9:16', 9 / 16],
    ['5:4', 5 / 4],
    ['21:9', 21 / 9],
  ];
  for (const [name, value] of named) {
    if (Math.abs(ratio - value) / value < 0.01) return name;
  }
  return null;
}

/** Replaces the extension on a filename, keeping the rest intact. */
export function replaceExtension(filename: string, extension: string): string {
  const base = filename.replace(/\.[^./\\]+$/, '');
  const safeBase = base.trim() || 'image';
  return `${safeBase}.${extension}`;
}

/** Adds a suffix before the extension: photo.jpg → photo-1200px.jpg */
export function addSuffix(filename: string, suffix: string): string {
  const match = filename.match(/^(.*?)(\.[^./\\]+)?$/);
  const base = (match?.[1] || 'image').trim() || 'image';
  const ext = match?.[2] || '';
  return `${base}${suffix}${ext}`;
}

/** Ensures every name in a batch is unique so a ZIP cannot silently drop files. */
export function uniqueName(name: string, taken: Set<string>): string {
  if (!taken.has(name)) {
    taken.add(name);
    return name;
  }
  const match = name.match(/^(.*?)(\.[^./\\]+)?$/);
  const base = match?.[1] || 'image';
  const ext = match?.[2] || '';
  let counter = 2;
  let candidate = `${base}-${counter}${ext}`;
  while (taken.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}${ext}`;
  }
  taken.add(candidate);
  return candidate;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
