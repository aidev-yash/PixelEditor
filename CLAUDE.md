# CLAUDE.md

Guidance for working in this repository.

## What this is

LocalPixel: a static Next.js 14 (App Router) site of fourteen browser-based
image tools. `output: 'export'`, `trailingSlash: true`. There is **no backend,
no API route, no database and no runtime server**. Read `README.md` for the
architecture and `VERIFY.md` for the verification checklist.

## Hard constraints

These come from the product owner and are not negotiable without being asked:

1. **All image processing happens in the visitor's browser.** Never add an
   upload, an API route, a server action, or any code that transmits file data.
2. **No cookies**, and no `localStorage`, `sessionStorage`, `indexedDB` or
   service worker. Not for processing, not for preferences, not for measurement.
   There is currently no match for any of those APIs in `src/` — keep it that
   way.
3. **No analytics, no telemetry, no third-party requests.** Fonts are
   self-hosted via `next/font/google`; `exifr` and `fflate` are bundled and
   dynamically imported from this origin. Adding a CDN script would falsify the
   copy on every page.
4. **Never claim "100% privacy", "zero data collection", "completely anonymous",
   "absolutely secure" or "military-grade" anything.** The Privacy Policy
   discloses that the web host can log page requests; that disclosure stays.
5. **Only make claims that are technically true of the implemented product.**
   AVIF is advertised only where `capabilities.ts` proves the browser can encode
   it. A KB target is "aimed at", never "guaranteed". Metadata verification is
   "a re-read with the same parser", never a forensic guarantee.
6. **Legal text must never obstruct the workspace.** No cookie banner, no modal,
   no overlay, no long legal block above or inside a tool. The legal documents
   live only on `/terms/`, `/privacy/` and `/cookies/`, linked from the footer.
7. **The legal pages must match the implementation.** If behaviour changes,
   change those pages in the same commit.

## Page structure rule

Every tool page must keep this order, top to bottom, with the tool visible
without scrolling past content:

> brand/header → tool name as the page `<h1>` → the tool workspace → tool
> switcher → About Us link → long-form content → footer

`components/content/ToolPage.tsx` enforces it. Do not reorder it and do not add
content above the workspace.

## Conventions

- **Server components by default.** Pages and all SEO content render to static
  HTML. Only the workspaces in `components/tools/` are `'use client'`.
- **One source of truth per concern.** Tool slugs, titles, descriptions, decks,
  blurbs and related links live in `src/lib/tools.ts`. Domain, brand, contact
  and dates live in `src/lib/site.ts`. Metadata and JSON-LD builders live in
  `src/lib/seo.ts`. The sitemap, footer, switcher and related-tool lists all
  read from the registry — never hardcode a route list.
- **Internal links use trailing slashes** (`/image-resizer/`), matching the
  canonicals and `trailingSlash: true`.
- **Design tokens only.** Colours come from the CSS variables in
  `globals.css` (`--ink`, `--paper`, `--surface`, `--rule`, `--signal`,
  `--local`, `--caution`, `--danger`, …) via the Tailwind theme. No raw hex in
  components.
- **Every page's copy must be genuinely distinct.** The spec forbids doorway
  pages and near-identical templates: each tool page has its own framing,
  settings vocabulary, limits, worked example and FAQ. Do not clone a page to
  make a new one.
- **State limits on the way in.** 50 files per batch, ~100 MP per image, first
  frame only for animation, transparency lost when converting to JPG — say so in
  the copy rather than letting the user discover it.

## Before writing any page copy

Read the component and library code that implements the behaviour you are about
to describe, then describe only that. Several inaccurate claims were caught this
way during the build (a "passport ratio" that did not exist, a zoom control that
did not exist, a megapixel limit enforced in a different function than claimed).
The claims table in `VERIFY.md` lists which statement maps to which file.

## Commands

```bash
npm run typecheck
```

```bash
npm run build
```

Note: as of the initial build, none of the npm scripts had been run — the
building session's shell was blocked by policy. Run `typecheck` and `build`
before trusting anything.
