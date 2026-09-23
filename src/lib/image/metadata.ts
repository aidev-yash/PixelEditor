/**
 * EXIF reading for the metadata inspector. Parsing happens in the browser on
 * bytes the visitor already has; the file is never sent anywhere.
 *
 * exifr is loaded on demand so the ~40 KB parser only reaches people who open
 * a tool that actually inspects metadata.
 */

export interface MetadataEntry {
  label: string;
  value: string;
}

export interface MetadataGroup {
  title: string;
  /** Location is flagged so the UI can highlight it. */
  sensitive?: boolean;
  entries: MetadataEntry[];
}

export interface MetadataReport {
  groups: MetadataGroup[];
  tagCount: number;
  gps: { latitude: number; longitude: number } | null;
  /** True when the parser ran but the file carried no readable metadata. */
  empty: boolean;
}

type RawTags = Record<string, unknown>;

function formatValue(key: string, value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toLocaleString();
  }

  if (Array.isArray(value)) {
    const parts = value.filter((v) => v !== null && v !== undefined);
    return parts.length ? parts.join(', ') : null;
  }

  if (typeof value === 'object') return null;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    if (key === 'ExposureTime') {
      return value >= 1 ? `${value} s` : `1/${Math.round(1 / value)} s`;
    }
    if (key === 'FNumber' || key === 'ApertureValue') return `f/${value}`;
    if (key === 'FocalLength') return `${value} mm`;
    if (key === 'FocalLengthIn35mmFormat') return `${value} mm (35mm equivalent)`;
    if (key === 'ISO') return `ISO ${value}`;
    if (key === 'GPSAltitude') return `${value.toFixed(1)} m`;
    if (key === 'latitude' || key === 'longitude') return value.toFixed(6);
    return String(Number.isInteger(value) ? value : Number(value.toFixed(4)));
  }

  return String(value);
}

const GROUP_DEFINITIONS: { title: string; sensitive?: boolean; keys: [string, string][] }[] = [
  {
    title: 'Location',
    sensitive: true,
    keys: [
      ['latitude', 'Latitude'],
      ['longitude', 'Longitude'],
      ['GPSAltitude', 'Altitude'],
      ['GPSDateStamp', 'GPS date'],
      ['GPSImgDirection', 'Direction faced'],
    ],
  },
  {
    title: 'Camera and lens',
    keys: [
      ['Make', 'Camera make'],
      ['Model', 'Camera model'],
      ['LensMake', 'Lens make'],
      ['LensModel', 'Lens model'],
      ['SerialNumber', 'Camera serial number'],
      ['BodySerialNumber', 'Body serial number'],
      ['LensSerialNumber', 'Lens serial number'],
    ],
  },
  {
    title: 'Capture settings',
    keys: [
      ['ExposureTime', 'Shutter speed'],
      ['FNumber', 'Aperture'],
      ['ISO', 'ISO'],
      ['FocalLength', 'Focal length'],
      ['FocalLengthIn35mmFormat', 'Focal length (35mm)'],
      ['Flash', 'Flash'],
      ['WhiteBalance', 'White balance'],
      ['ExposureProgram', 'Exposure program'],
      ['MeteringMode', 'Metering mode'],
    ],
  },
  {
    title: 'Dates',
    keys: [
      ['DateTimeOriginal', 'Taken'],
      ['CreateDate', 'Created'],
      ['ModifyDate', 'Modified'],
    ],
  },
  {
    title: 'Software and authorship',
    keys: [
      ['Software', 'Software'],
      ['Artist', 'Artist'],
      ['Copyright', 'Copyright'],
      ['OwnerName', 'Owner name'],
      ['HostComputer', 'Host computer'],
      ['ImageDescription', 'Description'],
      ['UserComment', 'User comment'],
    ],
  },
  {
    title: 'Image properties',
    keys: [
      ['Orientation', 'Orientation'],
      ['ExifImageWidth', 'Stored width'],
      ['ExifImageHeight', 'Stored height'],
      ['ColorSpace', 'Colour space'],
      ['XResolution', 'X resolution'],
      ['YResolution', 'Y resolution'],
      ['ResolutionUnit', 'Resolution unit'],
    ],
  },
];

async function loadExifr(): Promise<{ parse: (input: Blob, options?: unknown) => Promise<RawTags | undefined> }> {
  const imported = (await import('exifr')) as unknown as Record<string, unknown>;
  // The package ships both CommonJS and ESM builds; bundlers disagree about
  // where the callable object lands, so accept either shape.
  const candidate = (imported.default ?? imported) as {
    parse?: (input: Blob, options?: unknown) => Promise<RawTags | undefined>;
  };
  if (typeof candidate.parse !== 'function') {
    throw new Error('The metadata parser failed to load.');
  }
  return candidate as { parse: (input: Blob, options?: unknown) => Promise<RawTags | undefined> };
}

export async function readMetadata(file: Blob): Promise<MetadataReport> {
  const exifr = await loadExifr();

  const tags =
    (await exifr.parse(file, {
      tiff: true,
      ifd0: true,
      exif: true,
      gps: true,
      interop: false,
      translateKeys: true,
      translateValues: true,
      reviveValues: true,
      mergeOutput: true,
      silentErrors: true,
    })) ?? {};

  const groups: MetadataGroup[] = [];
  let tagCount = 0;

  for (const definition of GROUP_DEFINITIONS) {
    const entries: MetadataEntry[] = [];
    for (const [key, label] of definition.keys) {
      const formatted = formatValue(key, tags[key]);
      if (formatted !== null) {
        entries.push({ label, value: formatted });
      }
    }
    if (entries.length) {
      tagCount += entries.length;
      groups.push({ title: definition.title, sensitive: definition.sensitive, entries });
    }
  }

  const latitude = typeof tags.latitude === 'number' ? tags.latitude : null;
  const longitude = typeof tags.longitude === 'number' ? tags.longitude : null;

  return {
    groups,
    tagCount,
    gps: latitude !== null && longitude !== null ? { latitude, longitude } : null,
    empty: tagCount === 0,
  };
}
