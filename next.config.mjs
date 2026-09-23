/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static HTML export. There is no server, no API route and no runtime
  // backend of any kind: every image operation happens in the visitor's browser.
  output: 'export',

  // Emits /image-resizer/index.html rather than /image-resizer.html, which keeps
  // the trailing-slash URL strategy identical on every static host. Canonicals,
  // sitemap entries and internal links all use the trailing slash to match.
  trailingSlash: true,

  // next/image optimisation requires a server; we do not ship one.
  images: { unoptimized: true },

  reactStrictMode: true,

  // No custom headers/redirects are possible in a static export; hosting-level
  // headers are documented in README.md instead.
};

export default nextConfig;
