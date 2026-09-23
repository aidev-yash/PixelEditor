# VERIFY.md

Everything in this project was written and reviewed by reading the source. The
shell in the session that built it was blocked by enterprise policy, so
**`npm install`, `npm run build`, `npm run typecheck` and `npm run lint` have
never been executed against this code.** This file is the checklist for doing
that, in the order that finds problems fastest.

---

## 1. Install and compile

```bash
npm install
```

```bash
npm run typecheck
```

```bash
npm run build
```

`build` must finish with a static export in `out/`. Expect **19 HTML routes** —
the homepage, fourteen tool pages, and four static pages:

```
/
/image-resizer/             /image-cropper/            /rotate-flip-image/
/image-compressor/          /jpg-to-png/               /png-to-jpg/
/jpg-to-webp/               /png-to-webp/              /webp-to-jpg/
/image-dimensions-checker/  /exif-remover/
/batch-image-resizer/       /batch-image-compressor/   /batch-image-converter/
/about/                     /terms/                    /privacy/
/cookies/
```

Plus `out/sitemap.xml`, `out/robots.txt` and `out/404.html`.

Likely first-run friction, none of it structural:

- **Missing icons.** `favicon.ico`, `icon.png`, `apple-icon.png` are not in
  `src/app/`. The build succeeds without them; browsers will just request
  `/favicon.ico` and get a 404 until you add yours.
- **Font download.** `next/font/google` fetches the font files at build time, so
  the first build needs network access. After that they are self-hosted.
- **Lint.** `eslint` and `eslint-config-next` are declared and `.eslintrc.json`
  exists, but `next lint` may still prompt once on first run.

Then check the real export rather than the dev server:

```bash
npm run preview
```

---

## 2. Delete the stray file

`src/components/tools/.scratch` is a one-line artefact of a mistyped write. It
has no extension, so nothing compiles it, but it should not be committed:

```bash
Remove-Item "src\components\tools\.scratch"
```

---

## 3. Functional checks, per tool

For each, load the page, drop an image, confirm the result downloads and opens.

| Page | Check |
| --- | --- |
| `/image-resizer/` | Exact pixels, percentage and preset modes; ratio lock; never-enlarge |
| `/image-cropper/` | Drag the frame and type values — both give the same pixels; ratio presets |
| `/rotate-flip-image/` | 90/180/270 and both mirrors; the change is in the pixels, not an EXIF tag |
| `/image-compressor/` | Quality mode and KB-target mode; the target search stops and reports honestly |
| `/jpg-to-png/`, `/png-to-jpg/` | Fill colour appears for PNG→JPG; alpha warning shows for PNGs with alpha |
| `/jpg-to-webp/`, `/png-to-webp/` | Lossless toggle on the PNG page; WebP option only if supported |
| `/webp-to-jpg/` | Animated WebP yields first frame; transparency filled |
| `/image-dimensions-checker/` | Multi-file table, DPI print sizes, copy-all to clipboard |
| `/exif-remover/` | A geotagged phone photo shows the location group; cleaned copy verifies clean |
| `/batch-image-resizer/` | 50-file cap message; duplicate skipping; mid-run stop; ZIP |
| `/batch-image-compressor/` | Missed-target remarks; grown-file flags; totals |
| `/batch-image-converter/` | Mixed input → one format; `-converted` suffix; AVIF only where supported |

Error paths worth forcing at least once:

- A `.txt` renamed to `.jpg` → a readable error, not a crash.
- A 0-byte file → a readable error.
- A file above ~100 MP → refused by `MAX_PIXELS` with a clear message.
- A corrupt file inside a batch → that row fails, the other rows continue.
- JavaScript disabled → the `<noscript>` banner shows and all page copy is still
  readable, because it is server-rendered.

---

## 4. Claims audit

Re-check these if you ever change the code. Each one is asserted in page copy:

| Claim in the copy | Where it comes from |
| --- | --- |
| Nothing is uploaded | No `fetch`, `XMLHttpRequest` or `sendBeacon` anywhere in `src/` |
| Nothing is stored | No `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie` |
| No cookies | Same — plus no server to set one |
| No analytics | No analytics package in `package.json`, no script tags in `layout.tsx` |
| No third-party requests | Fonts via `next/font/google` (downloaded at build); `exifr` and `fflate` bundled and dynamically imported from this origin |
| Web Worker with fallback | `lib/workers/client.ts` |
| AVIF only where supported | `lib/image/capabilities.ts` test encode + `FormatPicker` gating |
| Metadata removal is lossless for JPG/PNG/WebP | `lib/image/strip.ts` segment/chunk walks |
| Removal is verified by re-reading | `ExifTool.tsx` re-parses the cleaned blob |
| 50 files per batch | `MAX_BATCH_FILES` in `useBatchQueue.ts` |
| ~100 MP limit | `MAX_PIXELS` in `lib/image/pipeline.ts` (enforced in `runProcess`, not in `inspect`) |
| Up to seven passes in KB-target mode | `maxPasses = 7` in `encodeToTarget`, `lib/image/encode.ts` |
| Each page's stated default quality | The `useState(...)` in that tool's component — resizer 82, cropper 88, compressor 75, rotate/flip 90, batch resize 82, batch compress 75, batch convert 85, and the convert pages via `defaultQuality` (88, or 85 on `/png-to-jpg/`). Two pages had drifted from this and were corrected; re-check whenever a default moves. |
| Ratio presets keep the current width | `applyRatio` in `CropperTool.tsx` derives the height and re-centres on the existing frame; only "Centre the frame" (`centredRatioRect`) fits the largest frame of that shape |
| Crop minimum 16 px per side | `MIN_SIZE` in `CropperTool.tsx` |
| The host can log requests | Disclosed in `/privacy/` — do not remove this disclosure |

The banned phrases, which appear nowhere and should stay that way: "100%
private", "zero data collection", "completely anonymous", "absolutely secure",
"military-grade".

---

## 5. SEO checks

- Every page has a unique `<title>` and meta description — they live in
  `src/lib/tools.ts` and the four static pages.
- Canonicals and `sitemap.xml` all use trailing slashes, matching
  `trailingSlash: true`.
- `SITE_URL` in `src/lib/site.ts` is still `https://localpixel.example`. **Set
  it to the real domain before launch** or every canonical will be wrong.
- Structured data: `WebSite` + `FAQPage` on the homepage, `SoftwareApplication`
  + `BreadcrumbList` + `FAQPage` on each tool page, `BreadcrumbList` on the
  legal pages, `Organization` site-wide. Validate a sample at
  <https://validator.schema.org/> and in Search Console's Rich Results Test.
- `FAQPage` markup is only emitted where a visible FAQ exists on the page.

---

## 6. Accessibility and responsive

- Tab through a tool page: skip link first, then header, workspace, switcher.
- Focus rings are visible everywhere (`:focus-visible` rule in `globals.css`).
- `prefers-reduced-motion` disables the reveal animations.
- Check 360 px, 768 px and 1280 px widths. The workspace, the batch table and
  the crop frame are the three places worth looking at on a phone.
- Progress is reported from real counts, never a fake indeterminate bar.
