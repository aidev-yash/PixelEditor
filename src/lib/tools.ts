/**
 * Tool registry — one entry per route. The header switcher, the sitemap, the
 * related-tool links, the homepage grid and every page's <title>/description
 * are all generated from this list, so a route can never drift out of sync
 * with its navigation or its canonical URL.
 */

export type ToolCategory =
  | 'Resize & crop'
  | 'Compress'
  | 'Convert'
  | 'Privacy & metadata'
  | 'Inspect'
  | 'Batch';

export interface ToolMeta {
  /** Route segment, also used as the React key and the related-tool reference. */
  slug: string;
  /** Short label used in the switcher, breadcrumbs and related-tool cards. */
  name: string;
  /** Visible <h1> on the tool's page. */
  h1: string;
  /** Unique <title>. */
  title: string;
  /** Unique meta description. */
  description: string;
  /** High-intent search keywords for SEO. */
  keywords: string[];
  /** One sentence printed directly under the h1. */
  deck: string;
  /** One line used on cards and in the switcher menu. */
  blurb: string;
  category: ToolCategory;
  /** Slugs of contextually related tools, ordered by usefulness. */
  related: string[];
}

export const TOOLS: ToolMeta[] = [
  {
    slug: 'image-resizer',
    name: 'Image resizer',
    h1: 'Image Resizer',
    title: 'Image Resizer: Resize Photos in Pixels or % | PixelEditor',
    description:
      'Resize images by exact pixels or percentage in your browser. No server uploads, instant scaling, and local processing for sensitive photos.',
    keywords: [
      'resize image without uploading',
      'resize passport photo without upload',
      'resize sensitive image locally',
      'browser image resizer client side',
      'client side image dimension scaler',
      'resize photo for govt exam 50kb',
    ],
    deck: 'Set exact pixels, scale by percentage, or pick a preset. The resize happens on this device.',
    blurb: 'Exact pixels, percentage or preset, with the aspect ratio locked by default.',
    category: 'Resize & crop',
    related: ['image-cropper', 'batch-image-resizer', 'image-dimensions-checker', 'image-compressor'],
  },
  {
    slug: 'image-cropper',
    name: 'Image cropper',
    h1: 'Image Cropper',
    title: 'Image Cropper: Crop Photos to Custom Aspect Ratio | PixelEditor',
    description:
      'Crop photos to custom dimensions or aspect ratios directly in your browser. Sensitive image data stays local while you crop and download.',
    keywords: [
      'crop photo without uploading',
      'crop confidential photo online',
      'private image cropper browser',
      'crop passport photo client side',
      'secure aspect ratio cropper',
    ],
    deck: 'Drag the crop frame or type exact values. Both paths give the same pixel-accurate result.',
    blurb: 'Drag-to-crop with ratio presets and exact numeric entry.',
    category: 'Resize & crop',
    related: ['image-resizer', 'rotate-flip-image', 'image-dimensions-checker', 'image-compressor'],
  },
  {
    slug: 'rotate-flip-image',
    name: 'Rotate & flip',
    h1: 'Rotate & Flip Image',
    title: 'Rotate & Flip Image Online (90°, 180°, Mirror) | PixelEditor',
    description:
      'Rotate images 90, 180, or 270 degrees and flip them horizontally or vertically directly in your browser without uploading files.',
    keywords: [
      'rotate image without uploading to server',
      'flip confidential image online',
      'rotate photo client side browser',
      'mirror image in browser free',
      'rotate scanned document securely',
      'mirror flip image client side',
    ],
    deck: 'Rotate in 90° steps and mirror either axis. The change is baked into the pixels, not just an orientation tag.',
    blurb: 'Quarter-turn rotation and mirroring, applied to the actual pixels.',
    category: 'Resize & crop',
    related: ['image-cropper', 'image-resizer', 'exif-remover', 'image-dimensions-checker'],
  },
  {
    slug: 'image-compressor',
    name: 'Image compressor',
    h1: 'Image Compressor',
    title: 'Image Compressor: Reduce Photo Size in KB | PixelEditor',
    description:
      'Compress JPEG, PNG, and WebP images directly in your browser. Reduce file size locally without uploading sensitive photos to a server.',
    keywords: [
      'private image compressor browser',
      'compress image without uploading to server',
      'shrink confidential photo file size',
      'client side photo compressor browser',
      'compress identity document under 200kb',
      'compress jpeg client side',
    ],
    deck: 'Choose a quality level or name a target size in KB and let the encoder search for it.',
    blurb: 'Quality slider or target-KB search, with honest before/after byte counts.',
    category: 'Compress',
    related: ['batch-image-compressor', 'jpg-to-webp', 'image-resizer', 'png-to-jpg'],
  },
  {
    slug: 'jpg-to-png',
    name: 'JPG to PNG',
    h1: 'JPG to PNG Converter',
    title: 'JPG to PNG Converter Online (Lossless) | PixelEditor',
    description:
      'Convert JPG and JPEG images to PNG directly in your browser without uploading the source file. Local processing keeps the workflow private.',
    keywords: [
      'convert jpg to png without upload',
      'client side jpg to png converter',
      'convert jpeg to png in browser',
      'convert sensitive jpg to png private',
      'browser based jpg to png secure',
    ],
    deck: 'Re-encode a JPG as a lossless PNG. Useful when a tool or form will not accept JPEG.',
    blurb: 'JPEG in, lossless PNG out — no upload, no signup.',
    category: 'Convert',
    related: ['png-to-jpg', 'jpg-to-webp', 'png-to-webp', 'batch-image-converter'],
  },
  {
    slug: 'png-to-jpg',
    name: 'PNG to JPG',
    h1: 'PNG to JPG Converter',
    title: 'PNG to JPG Converter Online (Custom Background) | PixelEditor',
    description:
      'Convert PNG files to JPG directly in your browser without uploading them. Choose an appropriate background when converting transparent images.',
    keywords: [
      'convert png to jpg without upload',
      'client side png to jpg converter',
      'convert transparent png to jpg white background',
      'private png to jpg client side',
      'browser png to jpg custom background',
    ],
    deck: 'Pick a quality level and a background colour for transparent pixels, then download the JPG.',
    blurb: 'PNG to JPG with a quality slider and a background colour for transparency.',
    category: 'Convert',
    related: ['jpg-to-png', 'image-compressor', 'png-to-webp', 'batch-image-converter'],
  },
  {
    slug: 'jpg-to-webp',
    name: 'JPG to WebP',
    h1: 'JPG to WebP Converter',
    title: 'JPG to WebP Converter Online (Smaller File Size) | PixelEditor',
    description:
      'Convert JPG and JPEG images to WebP directly in your browser without uploading them to a server. Adjust output quality locally.',
    keywords: [
      'convert jpg to webp without upload',
      'batch jpg to webp client side',
      'browser jpg to webp converter',
      'convert jpeg to webp for web performance',
      'local jpg to webp converter',
      'convert jpg to webp client side',
    ],
    deck: 'WebP usually lands smaller than JPEG at the same visual quality. Compare both before you download.',
    blurb: 'JPEG to WebP with a live size comparison against the original.',
    category: 'Convert',
    related: ['webp-to-jpg', 'png-to-webp', 'image-compressor', 'batch-image-converter'],
  },
  {
    slug: 'png-to-webp',
    name: 'PNG to WebP',
    h1: 'PNG to WebP Converter',
    title: 'PNG to WebP Converter Online (Keep Transparency) | PixelEditor',
    description:
      'Convert PNG images to WebP directly in your browser while preserving transparency. Process files locally without uploading them to a server.',
    keywords: [
      'convert png to webp client side',
      'convert transparent png to webp without upload',
      'lossless png to webp client side',
      'private png to webp converter',
      'client side png to webp transparent',
    ],
    deck: 'Lossless or lossy, with the alpha channel preserved either way.',
    blurb: 'PNG to WebP in lossless or lossy mode, transparency kept.',
    category: 'Convert',
    related: ['jpg-to-webp', 'webp-to-jpg', 'png-to-jpg', 'batch-image-converter'],
  },
  {
    slug: 'webp-to-jpg',
    name: 'WebP to JPG',
    h1: 'WebP to JPG Converter',
    title: 'WebP to JPG Converter Online (Universal Format) | PixelEditor',
    description:
      'Convert WebP images to standard JPG format directly in your browser. Process files locally and download the converted image without server uploads.',
    keywords: [
      'convert webp to jpg without upload',
      'save webp as jpg in browser',
      'client side webp to jpg converter',
      'convert google webp to jpg private',
      'webp to jpg high quality client side',
    ],
    deck: 'For the forms, printers and older apps that still refuse WebP.',
    blurb: 'WebP to JPG for software that will not open WebP.',
    category: 'Convert',
    related: ['jpg-to-webp', 'png-to-webp', 'png-to-jpg', 'batch-image-converter'],
  },
  {
    slug: 'image-dimensions-checker',
    name: 'Dimensions checker',
    h1: 'Image Dimensions Checker',
    title: 'Image Dimensions Checker: Width, Height & DPI | PixelEditor',
    description:
      'Check image width, height, aspect ratio, and file size directly in your browser. Inspect image dimensions locally without uploading the file.',
    keywords: [
      'check image dimensions without upload',
      'inspect image pixels client side',
      'check photo resolution in browser',
      'image aspect ratio calculator no upload',
      'check image dpi resolution browser secure',
      'check image dimensions pixels online',
    ],
    deck: 'Width, height, ratio, megapixels, byte size and the real format read from the file header.',
    blurb: 'Read dimensions, ratio, megapixels and the true format from the file bytes.',
    category: 'Inspect',
    related: ['image-resizer', 'image-cropper', 'exif-remover', 'image-compressor'],
  },
  {
    slug: 'exif-remover',
    name: 'EXIF remover',
    h1: 'EXIF & Metadata Remover',
    title: 'EXIF & Metadata Remover Online (Strip Photo GPS) | PixelEditor',
    description:
      'Remove supported EXIF metadata, GPS coordinates, camera information, and timestamps locally in your browser before sharing photos.',
    keywords: [
      'strip photo gps location client side',
      'exif cleaner browser client side',
      'remove metadata from photo without upload',
      'delete photo location data locally',
      'private exif stripper online',
    ],
    deck: 'See exactly what the file is carrying, then remove it without touching a single pixel.',
    blurb: 'Inspect GPS, camera and timestamp tags, then strip them losslessly.',
    category: 'Privacy & metadata',
    related: ['image-dimensions-checker', 'image-compressor', 'image-resizer', 'rotate-flip-image'],
  },
  {
    slug: 'batch-image-resizer',
    name: 'Batch resizer',
    h1: 'Batch Image Resizer',
    title: 'Batch Image Resizer: Bulk Resize Photos Locally | PixelEditor',
    description:
      'Resize multiple images directly in your browser with local processing. Apply dimensions to a batch and download the processed files together.',
    keywords: [
      'bulk image resizer in browser',
      'batch resize images client side',
      'resize multiple images locally free',
      'client side bulk image resizer',
      'batch resize png jpg webp browser',
    ],
    deck: 'One setting, many files, one ZIP at the end — and none of them leave the browser.',
    blurb: 'Resize a whole folder of images at once and download a ZIP.',
    category: 'Batch',
    related: ['image-resizer', 'batch-image-compressor', 'batch-image-converter', 'image-cropper'],
  },
  {
    slug: 'batch-image-compressor',
    name: 'Batch compressor',
    h1: 'Batch Image Compressor',
    title: 'Batch Image Compressor: Bulk Photo Size Reducer | PixelEditor',
    description:
      'Compress multiple images locally in your browser without uploading them to a server. Monitor processing and download the optimized batch.',
    keywords: [
      'batch compress images client side',
      'bulk image compression without uploading',
      'client side bulk image compressor',
      'compress multiple photos locally free',
      'bulk photo size reducer in browser',
    ],
    deck: 'Shared quality or a per-file KB target, with a running total of what you saved.',
    blurb: 'Bulk compression with a per-file KB target and a ZIP download.',
    category: 'Batch',
    related: ['image-compressor', 'batch-image-resizer', 'batch-image-converter', 'jpg-to-webp'],
  },
  {
    slug: 'batch-image-converter',
    name: 'Batch converter',
    h1: 'Batch Image Converter',
    title: 'Batch Image Converter: Bulk JPG, PNG & WebP | PixelEditor',
    description:
      'Convert multiple JPG, PNG, and WebP images directly in your browser. Process batches locally and download the converted files together.',
    keywords: [
      'client side bulk image converter',
      'convert multiple images locally free',
      'bulk image converter in browser',
      'client side bulk webp png jpg converter',
      'batch photo format converter browser',
      'bulk convert webp client side',
    ],
    deck: 'Mixed input formats in, one consistent output format out, packed into a ZIP.',
    blurb: 'Convert mixed formats to one target format, then download a ZIP.',
    category: 'Batch',
    related: ['batch-image-compressor', 'batch-image-resizer', 'jpg-to-png', 'webp-to-jpg'],
  },
];

export const CATEGORY_ORDER: ToolCategory[] = [
  'Resize & crop',
  'Compress',
  'Convert',
  'Privacy & metadata',
  'Inspect',
  'Batch',
];

export function toolHref(slug: string): string {
  return `/${slug}/`;
}

export function getTool(slug: string): ToolMeta {
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) {
    throw new Error(`Unknown tool slug: ${slug}`);
  }
  return tool;
}

export function getTools(slugs: string[]): ToolMeta[] {
  return slugs.map(getTool);
}

export function toolsByCategory(): { category: ToolCategory; tools: ToolMeta[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    tools: TOOLS.filter((t) => t.category === category),
  })).filter((group) => group.tools.length > 0);
}

/** Static pages that belong in the sitemap alongside the tools. */
export const STATIC_PAGES = [
  { path: '/', priority: 1.0 },
  { path: '/about/', priority: 0.6 },
  { path: '/privacy/', priority: 0.4 },
  { path: '/terms/', priority: 0.3 },
  { path: '/cookies/', priority: 0.3 },
];
