# LocalPixel — A–Z Implementation Plan

Status: **AWAITING APPROVAL** (no implementation code written yet)
Location: `C:\Users\dell\Claude Web\localpixel\`

Locked decisions from the question gate:

| Decision | Value |
|---|---|
| Brand | **LocalPixel** |
| Stack | Next.js App Router + TypeScript + Tailwind, `output: 'export'` (pure static HTML) |
| Analytics / cookies | **None.** No third-party scripts, no cookies, no consent banner |
| Optional features | Target file-size (KB) mode, EXIF metadata inspector, AVIF output (capability-detected) |
| Theme | Light only (dark mode not selected) |
| Canonical domain | Single configurable `SITE_URL` constant (placeholder until domain is bought) |
| Legal contact | support@mrmanager.me |
| Rotate/flip route | `/rotate-flip-image/` |
| Design direction | Instrument Panel (tool) + Editorial (content) hybrid |

---

## DESIGN READ

- **Page type:** utility tool pages with substantial SEO content underneath
- **Audience:** search traffic with an immediate job ("resize passport photo to 50 KB", "remove GPS from photo", "convert webp to jpg"); mixed technical literacy; heavily mobile
- **Brand personality:** precise, plain-spoken, no upsell, technically honest
- **Visual direction:** cold precision instrument above the fold, authored editorial article below it
- **Motion intensity:** Low (state transitions, real progress, content reveals only)
- **Visual density:** medium-high inside the workspace, low and airy in the content
- **Accessibility target:** WCAG 2.2 AA
- **Performance sensitivity:** high — large image decode on low-end mobile is the real risk

---

## A. PROJECT STRUCTURE

```
C:\Users\dell\Claude Web\localpixel\
  package.json
  next.config.mjs            output: 'export', trailingSlash: true, images.unoptimized
  tsconfig.json
  tailwind.config.ts
  postcss.config.mjs
  README.md                  setup, build, deploy, go-live checklist
  PLAN.md                    this file
  VERIFY.md                  manual verification checklist (because I cannot run a build here)
  CLAUDE.md                  project rules for future sessions
  public/
    (no images yet — logo/favicon supplied by you later; placeholder favicon route noted in README)
  src/
    app/
      layout.tsx             header/footer shell, fonts, metadataBase
      globals.css            design tokens + base layer
      page.tsx               homepage
      sitemap.ts             generated sitemap.xml
      robots.ts              generated robots.txt
      not-found.tsx          404
      about/page.tsx
      terms/page.tsx
      privacy/page.tsx
      cookies/page.tsx
      image-resizer/page.tsx
      image-cropper/page.tsx
      rotate-flip-image/page.tsx
      image-compressor/page.tsx
      jpg-to-png/page.tsx
      png-to-jpg/page.tsx
      jpg-to-webp/page.tsx
      png-to-webp/page.tsx
      webp-to-jpg/page.tsx
      image-dimensions-checker/page.tsx
      exif-remover/page.tsx
      batch-image-resizer/page.tsx
      batch-image-compressor/page.tsx
      batch-image-converter/page.tsx
    components/
      layout/    SiteHeader, ToolSwitcher, SiteFooter, Breadcrumbs
      content/   ToolPageLayout, Section, Prose, Faq, RelatedTools, AboutSection, LimitationList
      tools/     DropZone, ImageCanvasPreview, NumberField, QualitySlider, SegmentedControl,
                 ReadoutStrip, DownloadBar, ProgressBar, BatchTable, ErrorNotice
      tools/*Tool.tsx  one interactive client component per tool family
    lib/
      site.ts    SITE_URL, brand, contact email, single source of truth
      tools.ts   tool registry (slug, name, category, blurb, related slugs)
      seo.ts     metadata + JSON-LD builders
      format.ts  byte/percent/dimension formatting
      image/     decode, encode, resize, targetSize, exif, strip, zip, capabilities
      workers/   image.worker.ts + typed client wrapper
```

Every project file lives in this folder. Nothing is written outside it.

## B. ARCHITECTURE

- 100% client-side image processing. **No backend, no API routes, no database, no storage.**
- Next.js static export → plain HTML/CSS/JS. Deployable to Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3, or any static host.
- Server components render all SEO content (fast HTML, crawlable without JS). Only the tool workspace is a client component (`'use client'`).
- Heavy work runs in a **Web Worker** using `OffscreenCanvas` + `createImageBitmap`. Capability-detected fallback to a main-thread path that yields between images so the UI never locks.

## C. TECHNOLOGIES

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Per-route metadata/canonical/OG, file-based routing, static export |
| Language | TypeScript (strict) | Catches encoder/format mistakes I cannot catch by running code here |
| Styling | Tailwind CSS 3.4 + CSS custom properties | v3.4 rather than v4 because I cannot run a build to debug the v4 PostCSS pipeline |
| Fonts | `next/font` (self-hosted) | Zero third-party requests — lets the privacy pages be literally true |
| Processing | Canvas 2D, `createImageBitmap`, `OffscreenCanvas`, `toBlob` | Native, no wasm payload |
| ZIP | `fflate` (~8 KB) | Battle-tested; hand-rolling a ZIP writer I cannot test is an unnecessary risk |
| EXIF read | `exifr` (lazy-imported, EXIF page only) | Mature parser for the inspector |
| EXIF strip | Custom JPEG marker / PNG chunk walker | Lets us strip metadata **without re-encoding pixels** |
| Animation | CSS transitions + IntersectionObserver | A 30 KB animation runtime buys nothing at this motion level |

Runtime dependencies: `next`, `react`, `react-dom`, `fflate`, `exifr`. That is the whole list.

## D. PAGES (20 routes)

14 tool pages, homepage, `/about/`, `/terms/`, `/privacy/`, `/cookies/`, 404.
All use trailing slashes, consistently, in canonicals, sitemap and internal links.

## E. COMPONENTS

Shared shells hold *structure*; every page supplies its own *content*. Tool logic is grouped into families so behaviour is consistent without the pages being clones:

- `ConvertTool` — parameterised for the 5 single-file conversion pages (source formats, target format, transparency handling, quality)
- `ResizerTool`, `CropperTool`, `RotateFlipTool`, `CompressorTool`, `DimensionsTool`, `ExifTool`
- `BatchResizeTool`, `BatchCompressTool`, `BatchConvertTool`

## F. DESIGN SYSTEM

**Palette** (light only)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0F1419` | Primary text |
| `--ink-muted` | `#59636F` | Secondary text, labels |
| `--paper` | `#F5F6F7` | Page background |
| `--surface` | `#FFFFFF` | Cards, workspace |
| `--rule` | `#DCE0E5` | Hairlines, dividers |
| `--instrument` | `#1B2430` | Workspace panel border/header |
| `--signal` | `#2C3CD1` | Primary action, focus ring, active state |
| `--local` | `#0B7A55` | "Processed on this device" status |
| `--caution` | `#9A5B06` | Limits, lossy warnings |
| `--danger` | `#B3261E` | Errors |

**Type**

- Display / H1 / section headings: **Instrument Serif** (editorial layer)
- UI + body: **IBM Plex Sans**
- All numerals, units, labels, readouts: **IBM Plex Mono** (tabular figures)

Scale: 12 / 14 / 16 / 18 / 21 / 28 / 38 / 52. Body 16px min, line-height 1.6, measure 66ch.

**Layout:** 8px spacing rhythm, max-width 1180px shell, 720px prose column, 2px instrument border on the workspace only, 0–4px radii (tool) and 0 radii (content rules).

**Signature element:** the **readout strip** — a monospace instrument bar under every workspace showing `IN 4032×3024 · 3.84 MB` → `OUT 1200×900 · 214 KB · −94.4%`, with a device-status chip that states processing ran locally. It is the one memorable component and it repeats, tuned, on all 14 tools.

## G. DESIGN DIRECTION

Instrument Panel + Editorial. The tool is cold, gridded, monospaced and dense; everything below it is a set, authored article with serif headings and a real measure. No gradients, no glass, no decorative blur.

## H. MOTION SYSTEM

- 120–180ms transitions on hover/active/disabled/expanded states
- Determinate progress bars driven by real batch progress (never fake)
- Readout numbers animate only on change, ≤200ms, tabular figures so nothing reflows
- Content sections: 12px rise + fade on first view, staggered 40ms, IntersectionObserver
- `prefers-reduced-motion: reduce` disables all of it; no motion inside the workspace during processing

## I. PAGE-BY-PAGE BEHAVIOUR

Fixed order on every tool page, tool always immediately after the heading:

1. Sticky header: **LocalPixel** wordmark · Tools · About
2. Breadcrumb (Home / Tools / This tool)
3. H1 + one-sentence deck
4. **Tool workspace**
5. Tool switcher ("Switch tool ▾" — keyboard accessible menu listing all 14)
6. Intro (2–3 paragraphs, unique)
7. How it works (actual implementation, unique)
8. How to use (numbered steps, unique)
9. Settings & options (every control explained)
10. Supported formats
11. Limitations (honest, tool-specific)
12. Why use LocalPixel (tool-specific benefits only)
13. Privacy on this page (tool-specific, accurate)
14. FAQ (4–6 real questions per tool, `<details>`, unique)
15. Related tools (contextual, from the cluster map)
16. About LocalPixel (short reusable block)
17. Footer: Terms · Privacy · Cookies

## J. BUTTON BEHAVIOUR

Every control does real work: `Choose files` (file input), `Process`, `Download`, `Download all (ZIP)`, `Reset`, `Remove file`, `Switch tool`, quality slider, dimension fields, aspect lock, rotate 90/180/270, flip H/V, crop presets, format select, KB target. Disabled until valid input exists; spinner + label change during async work; no dead controls anywhere.

## K. FORMS

No submissions, no backend. The "forms" are tool controls: labelled inputs, inline validation on blur, errors adjacent to the field with `aria-describedby`, numeric constraints (1–20000 px, quality 1–100, KB target ≥ 1), and clear recovery text ("This file decoded as 0×0 — the browser could not read it. Try a JPG, PNG or WebP.").

## L. NAVIGATION

Header (wordmark, Tools, About) + breadcrumb + tool switcher + contextual related links + footer map. Every tool reachable from every tool in one interaction.

## M. APIs

None. No network request is made during image processing.

## N. DATABASE

None.

## O. AUTHENTICATION

None. No accounts anywhere in the product.

## P. SECURITY

No secrets exist to leak. Files are read via object URLs that are revoked on reset/unmount. File type sniffed from bytes, not just extension. Size guard with an explicit warning above ~30 MP on mobile. No `dangerouslySetInnerHTML` except the JSON-LD script tags, which are built from typed objects.

## Q. ASSETS

No images ship in v1. Logo and favicon are yours to add later; README documents exactly where to drop them (`public/favicon.ico`, `public/og.png`) and which line to change. The wordmark is set type until then. No stock photography, no icon font — inline SVG icons only.

## R. RESPONSIVE

375 / 768 / 1024 / 1440. Mobile: single column, controls stack under the preview, sticky download bar, 44px targets, no horizontal scroll. Desktop: preview left / controls right inside the workspace. Batch table becomes a card list under 768px.

## S. ACCESSIBILITY

Semantic landmarks, single H1, sequential headings, visible 2px focus rings, drag-and-drop **always** paired with a real file input, crop editable by number as well as by drag, `aria-live="polite"` progress announcements, 4.5:1 text contrast, `<details>` FAQs (keyboard-native), reduced-motion support.

## T. PERFORMANCE

Static HTML, no third-party scripts, self-hosted fonts with `font-display: swap`, tool components code-split per route, `exifr` and `fflate` lazily imported only where used, worker off the main thread, bitmaps closed after use, object URLs revoked, stepped downscaling for quality without huge intermediate buffers.

## U. SEO

Per-page unique title/description/H1/content from your keyword matrix; canonical + OG + Twitter tags; `WebSite`+`Organization` JSON-LD on home; `SoftwareApplication` + `BreadcrumbList` + `FAQPage` on tool pages (FAQ content is visibly on the page); sitemap.xml with all 19 indexable routes; robots.txt allowing all and pointing at the sitemap; internal links following your five cluster maps.

## V. ERROR HANDLING

Unsupported/corrupt file, zero-byte file, decode failure, encoder unsupported (e.g. AVIF absent → option hidden with a reason), memory failure on huge images, worker crash → main-thread retry, batch partial failure (per-row error, ZIP still offered for successes), no-file state.

## W. LOADING & EMPTY STATES

Empty dropzone explains accepted formats; per-file status chips (queued / working / done / failed); determinate batch progress; skeleton-free instant HTML since content is server-rendered.

## X. TESTING

I cannot execute anything in this session (enterprise policy blocks all shell commands). So: strict TypeScript, no untested hand-rolled binary formats where a mature 8 KB library exists, careful code review pass over every encoder/decoder path, and a written `VERIFY.md` with the exact commands and a click-through checklist for you.

## Y. VERIFICATION

You run:

```
npm install
npm run dev      → click through the checklist in VERIFY.md
npm run build    → static export to ./out
```

I will attempt the in-app browser preview tool at the end; if it can start the dev server despite the shell policy, I will test the flows myself and report real results. If it cannot, I will say so plainly rather than claim it works.

## Z. DEPLOYMENT

`npm run build` emits `./out` — drop on any static host. README covers Vercel / Netlify / Cloudflare Pages, the one-line `SITE_URL` change, and the pre-launch checklist (real domain, favicon, contact inbox, host-log disclosure in the privacy policy).

---

## BUILD ORDER

1. Scaffold + config + tokens + fonts + layout shell + tool registry
2. Processing core (decode, resize, encode, capabilities, target-size, worker)
3. Single-file tools: resizer → compressor → cropper → rotate/flip → dimensions
4. Conversion family (5 pages) + EXIF tool
5. Batch family (3 pages) + ZIP
6. Homepage, About, legal pages, sitemap/robots, JSON-LD
7. Unique long-form content for all 14 tool pages
8. Review pass: a11y, responsive, error paths, dead code, claim accuracy
9. Attempt browser verification, then honest final report

## CLAIMS LEDGER (what the site is allowed to say)

Allowed, because the implementation supports it: images are processed in your browser; no upload request is made for processing; no account; no watermark; no cookies; no analytics; no third-party scripts; batch results zipped locally.

Not allowed: 100% private/secure, zero data collection, never leaves your device (fonts/HTML still come from a host), guaranteed compression percentages, fully offline (no service worker in v1), all metadata removed from every format, unlimited batch size.
