/**
 * ZIP packaging for batch downloads. fflate runs entirely in the page, so the
 * archive is assembled on the visitor's machine and handed straight to the
 * browser's download mechanism.
 *
 * Level 0 (store) is deliberate: JPEG, PNG and WebP payloads are already
 * compressed, so deflating them again costs CPU and saves almost nothing.
 */

export interface ZipEntry {
  name: string;
  blob: Blob;
}

export async function buildZip(entries: ZipEntry[]): Promise<Blob> {
  if (entries.length === 0) {
    throw new Error('There are no finished files to package.');
  }

  const { zipSync } = await import('fflate');

  const payload: Record<string, [Uint8Array, { level: 0 }]> = {};
  for (const entry of entries) {
    payload[entry.name] = [new Uint8Array(await entry.blob.arrayBuffer()), { level: 0 }];
  }

  const archive = zipSync(payload, { level: 0 });
  return new Blob([archive], { type: 'application/zip' });
}
