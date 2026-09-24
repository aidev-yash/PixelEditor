# LocalPixel

Privacy-first image tools that run entirely in the visitor's browser. Fourteen
single-purpose tools — resize, crop, rotate/flip, compress, five format
conversions, dimensions inspection, metadata removal, and batch resize/compress/
convert — each on its own page and URL.

No backend. No uploads. No accounts. No cookies. No analytics. No third-party
requests.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>. In the Claude desktop app you can also start
it from `.claude/launch.json` (server name `localpixel-dev`).

Other scripts:

| Script              | What it does                                                 |
| ------------------- | ------------------------------------------------------------ |
| `npm run dev`       | Dev server on port 3000                                      |
| `npm run build`     | Static export to `out/` (19 HTML pages + sitemap + robots)    |
| `npm run preview`   | Serves the built `out/` directory, to check the real export   |
| `npm run typecheck` | `tsc --noEmit`                                               |
| `npm run lint`      | `next lint`                                                  |

---

## Before you deploy

1. **Set the domain.** `src/lib/site.ts` → `SITE_URL` (no trailing slash). It
   drives every canonical tag, Open Graph URL, `sitemap.xml` entry and
   `robots.txt` line. Configured for `https://pixeleditor.mrmanager.me`.
2. **Add the icons.** `favicon.ico`, `icon.png` (512×512) and `apple-icon.png`
   (180×180) in `src/app/`, plus `opengraph-image.png` (1200×630) if you want a
   social preview card. Next.js picks these up by filename automatically — no
   code change needed. (You said you would supply the logo and favicon.)
3. **Check the legal pages.** `/terms/`, `/privacy/` and `/cookies/` describe
   this implementation accurately, but they are not legal advice. `Governing
   law` in the Terms deliberately refers to "the jurisdiction in which the
   operator of this site is established" rather than naming a country — name
   yours if you want it explicit. The contact address is
   `CONTACT_EMAIL` in `src/lib/site.ts`.
4. **Update the date.** `LEGAL_LAST_UPDATED` and `CONTENT_LAST_MODIFIED` in
   `src/lib/site.ts`.
5. **Deploy `out/`.** Any static host: Netlify, Cloudflare Pages, GitHub Pages,
   S3 + CloudFront, Vercel. Nothing needs Node at runtime.

### Recommended hosting headers

A static export cannot set its own headers, so configure these at the host. They
are what make the "no third-party requests" claim enforceable rather than merely
true today:

```
Content-Security-Policy: default-src 'self'; img-src 'self' blob: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' blob:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'none'
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

`blob:` is required for `img-src`, `connect-src` and `worker-src`: previews,
decoding and the Web Worker all use blob URLs. `'unsafe-inline'` for scripts
covers Next's inline bootstrap and the JSON-LD blocks; tighten it with nonces
only if your host can inject them.

---

## Architecture

```
src/
  app/
    layout.tsx              root shell: fonts, header, footer, Organization JSON-LD
    page.tsx                homepage (WebSite + FAQPage JSON-LD)
    <tool-slug>/page.tsx    14 tool pages, one per route
    about|terms|privacy|cookies/page.tsx
    sitemap.ts robots.ts not-found.tsx
    globals.css             design tokens + editorial prose rules
  components/
    layout/                 header, footer, breadcrumbs, tool switcher, JSON-LD
    content/                ToolPage, LegalPage, Section, Faq, RelatedTools, …
    tools/                  the workspaces (all 'use client') + shared controls
  lib/
    image/                  decode, resize, encode, pipeline, strip, metadata, zip
    workers/                Web Worker + client with main-thread fallback
    tools.ts                the tool registry: slugs, titles, copy, relations
    seo.ts                  metadata + JSON-LD builders
    site.ts                 SITE_URL, brand, contact, dates
```

**Server components by default.** Every page and all SEO content is a server
component rendered to static HTML at build time. Only the workspaces under
`components/tools/` are `'use client'`, so a tool page's text is in the HTML
whether or not JavaScript runs.

**The processing path.** `File` → `decode.ts` (`createImageBitmap`, with a
no-options retry and an `<img>` fallback) → `resize.ts` (halving-step downscale
for quality) → `encode.ts` (`canvas.convertToBlob` / `toBlob`) → `Blob` →
download. `pipeline.ts` sequences it and enforces `MAX_PIXELS` (100 MP).

**Web Workers.** `lib/workers/client.ts` posts work to `image.worker.ts` and
falls back permanently to the main thread if the worker cannot start. The
fallback is not a stub — it runs the identical pipeline.

**Encoder capability probing.** `capabilities.ts` encodes an 8×8 test image in
each candidate format and checks the result's MIME type. WebP and AVIF options
appear only after that succeeds, which is why AVIF is offered on some browsers
and not others. Nothing advertises a format the browser has not proven.

**Metadata removal is lossless where it can be.** `strip.ts` walks the JPEG
segment list (dropping APPn and COM, keeping ICC when asked), the PNG chunk
list, and the WebP RIFF chunks, copying the compressed picture data across
untouched. Other formats fall back to a re-encode, and the UI says so.

**Batch.** `useBatchQueue.ts` caps a run at 50 files, de-duplicates by
`name:size:lastModified`, processes sequentially (parallel decoding is the
fastest way to have a mobile browser kill the tab), contains per-file failures,
supports mid-run cancel, and builds the ZIP in-page with `fflate`.

---

## The claims discipline

Every factual statement in the page copy was written against the code that
implements it, and the wording is deliberately narrow:

- **Said:** images are processed in your browser and not transmitted to us;
  no cookies; no analytics; no third-party requests; nothing stored.
- **Not said:** "100% private", "zero data collection", "absolutely secure".
  The Privacy Policy explicitly discloses that the web host can log page
  requests (IP, timestamp, user agent), because it can.
- Target file sizes are described as aimed at, not guaranteed. Metadata
  verification is described as a re-read with the same parser, not a forensic
  guarantee. AVIF is described as available only where the browser proves it.

If you change behaviour, change the copy. `VERIFY.md` lists what to re-check.

---

## Verifying the privacy claims yourself

With the site open in any browser:

- **Network panel** — use any tool, then look at the requests. You will see the
  page, the CSS, the fonts and the JS chunks, all from this origin. No request
  carries image data; there is no upload endpoint to carry it to.
- **Application/Storage panel** — cookies, local storage, session storage and
  IndexedDB are all empty while the tools are in use.
- **Offline** — load a tool page, switch off the network, and process an image.
  Everything still works.
- **Source** — search `src/` for `fetch(`, `localStorage`, `sessionStorage`,
  `indexedDB` or `document.cookie`. There are no matches; the site contains no
  code that could send or store anything.

---

## Adding a tool

1. Add an entry to `TOOLS` in `src/lib/tools.ts` (slug, name, h1, unique title
   and description, deck, blurb, category, related slugs).
2. Build the workspace in `src/components/tools/`, marked `'use client'`.
3. Create `src/app/<slug>/page.tsx` following the shape used by the existing
   tool pages: `toolMetadata(getTool(SLUG))`, then `<ToolPage>` with `features`,
   `faq` and the content sections.
4. Write the copy against the code, not against the intent. Include the limits.

The sitemap, the tool switcher, the footer and the related-tool links all read
from the registry, so nothing else needs editing.
