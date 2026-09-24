/**
 * Single source of truth for anything that changes when the site moves to its
 * real domain. Change SITE_URL here and canonicals, Open Graph URLs, the
 * sitemap and robots.txt all follow.
 */

/** No trailing slash. Change this to the production domain before launch. */
export const SITE_URL = 'https://pixeleditor.mrmanager.me';

export const BRAND = 'PixelEditor';

export const TAGLINE = 'Image tools that run on your device';

export const CONTACT_EMAIL = 'support@mrmanager.me';

/** Shown on the legal pages. Update when the documents are revised. */
export const LEGAL_LAST_UPDATED = '24 September 2026';

/**
 * Date reported in the sitemap. Deliberately a constant rather than the build
 * date, so a rebuild with no content change does not tell crawlers that every
 * page was modified. Bump it when pages actually change.
 */
export const CONTENT_LAST_MODIFIED = '2026-09-24';

/** Builds an absolute URL for canonicals, Open Graph and the sitemap. */
export function absoluteUrl(path: string): string {
  if (path === '/') return `${SITE_URL}/`;
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  // Do not append trailing slash to static file assets (e.g. .png, .svg, .xml, .txt, .webmanifest)
  const isFile = /\.[a-zA-Z0-9]+$/.test(withLeading);
  if (isFile) return `${SITE_URL}${withLeading}`;
  const withTrailing = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  return `${SITE_URL}${withTrailing}`;
}
