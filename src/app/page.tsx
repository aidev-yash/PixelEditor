import type { Metadata } from 'next';
import Link from 'next/link';
import { AboutSection } from '@/components/content/AboutSection';
import { Faq } from '@/components/content/Faq';
import { Reveal } from '@/components/content/Reveal';
import { BenefitList, LimitList, Section, Steps } from '@/components/content/Section';
import { JsonLd } from '@/components/layout/JsonLd';
import { faqJsonLd, pageMetadata, websiteJsonLd, type FaqItem } from '@/lib/seo';
import { BRAND } from '@/lib/site';
import { toolHref, toolsByCategory } from '@/lib/tools';

export const metadata: Metadata = pageMetadata({
  title: 'PixelEditor — Free & 100% Private Online Photo Tools',
  description:
    'Process images directly in your browser with local image tools for resizing, cropping, compression, conversion, dimensions, EXIF cleaning, and batch processing.',
  keywords: [
    'privacy first image processing online',
    'client side image editor',
    'client side photo editing suite',
    'bulk image tools in browser',
    'local browser image tools',
    'browser image processing',
    'private image tools',
    'PixelEditor',
  ],
  path: '/',
});

const FAQ: FaqItem[] = [
  {
    q: 'Are my images uploaded to a server?',
    a: 'No. Every tool on this site decodes and re-encodes your file inside the browser tab using the Canvas API, so no upload request is made in order to process an image. You can confirm it yourself: open your browser’s network panel, run any tool, and you will see no request carrying your file.',
  },
  {
    q: 'Do I need to create an account or install anything?',
    a: 'Neither. The tools are ordinary web pages. Open the page for the job you need, pick a file, and download the result. There is no signup, no email confirmation, no extension and no desktop installer.',
  },
  {
    q: 'Is there a watermark or a file-size paywall?',
    a: 'No watermark is added to any output, and no feature is held back for a paid tier. The practical limits are your device’s memory and the formats your browser can write, not a billing plan.',
  },
  {
    q: 'Which formats can PixelEditor read and write?',
    a: 'It can read anything your browser can decode, which in practice means JPG, PNG, WebP, GIF, BMP and usually AVIF. It writes JPG and PNG everywhere, WebP in every current browser, and AVIF only where the browser proves it can encode it — the option is hidden when it cannot.',
  },
  {
    q: 'Why does the site need JavaScript?',
    a: 'Because the image processing is the JavaScript. There is no server-side image pipeline to fall back on, so with JavaScript disabled the written guides still read normally but the tools themselves cannot run.',
  },
  {
    q: 'Does it work on a phone?',
    a: 'Yes, in a current mobile browser. Very large photographs are more likely to fail on a phone than on a laptop, because a mobile browser tab has much less memory to hold a decoded image, and a long batch will also make the device warm.',
  },
];

export default function HomePage() {
  const groups = toolsByCategory();

  return (
    <>
      <div className="mx-auto max-w-shell px-[var(--shell-x)] pb-16 pt-10 sm:pt-14">
        <Reveal delay={40}>
          <header className="max-w-prose">
            <p className="font-mono text-2xs uppercase tracking-wider text-ink-muted">{BRAND}</p>
            <h1 className="mt-3 font-display text-3xl leading-[1.05] text-ink sm:text-5xl">
              Privacy-First Image Tools
            </h1>
            <p className="mt-5 text-lg text-ink-muted">
              Fourteen single-purpose tools for resizing, cropping, compressing, converting and
              cleaning images — each one doing its work inside your browser, with no upload step
              before you can use it.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { slug: 'image-resizer', label: 'Resize an image' },
                { slug: 'image-compressor', label: 'Compress to a target KB' },
                { slug: 'exif-remover', label: 'Remove EXIF and GPS' },
              ].map((item) => (
                <Link
                  key={item.slug}
                  href={toolHref(item.slug)}
                  className="quick-pill border border-instrument bg-instrument px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="#all-tools"
                className="quick-pill border border-rule bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-instrument hover:bg-surface"
              >
                See all fourteen
              </a>
            </div>
          </header>
        </Reveal>

        {/* The tool directory sits high on the page: on the homepage this is the
            thing a visitor came for, in place of a workspace. */}
        <section id="all-tools" className="mt-12 scroll-mt-20">
          <Reveal delay={80}>
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-instrument pb-3">
              <h2 className="font-display text-2xl leading-tight text-ink">Every tool</h2>
              <p className="font-mono text-2xs uppercase tracking-wider text-ink-muted">
                one job per page, one URL per job
              </p>
            </div>
          </Reveal>

          <div className="mt-6 space-y-10">
            {groups.map((group, groupIdx) => (
              <Reveal key={group.category} delay={groupIdx * 70}>
                <div>
                  <h3 className="font-mono text-2xs uppercase tracking-wider text-ink-muted">
                    {group.category}
                  </h3>
                  <ul className="mt-3 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
                    {group.tools.map((tool) => (
                      <li key={tool.slug} className="tool-card bg-surface">
                        <Link
                          href={toolHref(tool.slug)}
                          className="group flex h-full flex-col gap-1.5 p-5 transition-colors hover:bg-paper"
                        >
                          <span className="text-base font-semibold text-ink group-hover:text-signal">
                            {tool.name}
                          </span>
                          <span className="text-sm text-ink-muted">{tool.blurb}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <article className="mt-16 space-y-12">
          <Section
            id="how-it-works"
            eyebrow="How it works"
            title="What happens when you pick a file"
          >
            <p>
              A normal image tool asks you to upload a file, does the work on a server, and sends a
              result back. {BRAND} skips the middle part. The browser already contains a complete
              image decoder and encoder, so the file can be read from your disk, worked on in
              memory, and handed back as a download without ever being put on the network.
            </p>
            <Steps
              items={[
                {
                  title: 'You choose a file',
                  detail:
                    'Drag it onto the drop area or use the file button. The browser gives the page a reference to the file on your disk — not a copy on a server.',
                },
                {
                  title: 'The browser decodes it',
                  detail:
                    'createImageBitmap turns the compressed bytes into pixels in memory. The first bytes are also sniffed, so the real format is known even when the extension lies.',
                },
                {
                  title: 'A Web Worker does the work',
                  detail:
                    'Resizing, cropping, rotating and encoding run on a background thread, which is why the page keeps responding while a large photo is processed.',
                },
                {
                  title: 'You see the real numbers',
                  detail:
                    'Output dimensions and byte size come from the finished file, not from an estimate, so the before-and-after figures are the ones you will actually download.',
                },
                {
                  title: 'You download the result',
                  detail:
                    'The finished bytes are handed to the browser as a normal download. Batch runs are packed into a ZIP in the tab first. Closing the tab discards everything.',
                },
              ]}
            />
          </Section>

          <Section
            id="why-pixeleditor"
            eyebrow="Why use it"
            title={`Why people use ${BRAND} instead of a server-side tool`}
          >
            <BenefitList
              items={[
                {
                  title: 'Nothing waits in a queue',
                  detail:
                    'There is no upload and no server-side job, so a 6 MB photo starts processing immediately instead of after a transfer.',
                },
                {
                  title: 'Sensitive files stay put',
                  detail:
                    'Scanned documents, passport photos, client screenshots and unreleased artwork are processed on your own device, so no copy is created elsewhere.',
                },
                {
                  title: 'Honest numbers',
                  detail:
                    'Each tool reports the real output size and dimensions, and says plainly when a target could not be met rather than quietly missing it.',
                },
                {
                  title: 'One page per job',
                  detail:
                    'Every tool has its own URL and its own settings, so you can bookmark the exact thing you keep needing instead of hunting through a dashboard.',
                },
                {
                  title: 'No account, no watermark',
                  detail:
                    'Nothing is held back for a paid tier. There is no signup step, no email confirmation and no watermark on any output.',
                },
                {
                  title: 'Works offline once loaded',
                  detail:
                    'The processing needs no network access, so a tool you already have open keeps working if your connection drops mid-task.',
                },
              ]}
            />
          </Section>

          <Section id="privacy" eyebrow="Privacy" title="What “in your browser” actually means here">
            <p>
              It means the image processing happens on your device. When you pick a file, it is read
              into the tab’s memory and handled there; no upload request is made in order to resize,
              crop, compress, convert or clean it. There is no processing server to receive it, no
              storage bucket, and no job queue.
            </p>
            <p>
              The site itself sets no cookies, loads no analytics, and requests nothing from a third
              party — the fonts are served from this domain rather than from a font CDN. Your images
              are never written to local storage or to a cache; they exist in memory while the tab
              is open and are gone when you close it.
            </p>
            <p>
              What we will not claim: that this is “100% private” or “zero data collection”. Loading
              any web page means your browser contacts the server that hosts it, and that server —
              like every web host — can log the request, which normally includes an IP address, a
              timestamp and a user-agent string. That log is about the page request, not about your
              pictures. The{' '}
              <Link href="/privacy/" className="text-signal underline underline-offset-2">
                Privacy Policy
              </Link>{' '}
              sets out exactly what that covers.
            </p>
          </Section>

          <Section id="limits" eyebrow="Limitations" title="Where a browser-based tool runs out">
            <p>
              Running on your device has real trade-offs, and it is better to know them before you
              start a large job than halfway through one.
            </p>
            <LimitList
              items={[
                'Very large images can exhaust the tab’s memory. Anything over roughly 100 megapixels is refused outright, because a canvas that size usually fails to allocate.',
                'Batches are capped at 50 files per run and processed one after another, which keeps memory use predictable but means a big folder takes several runs.',
                'Animated GIFs and animated WebP are flattened to a single frame — these tools work on still images.',
                'AVIF and WebP output depend on your browser. Each tool asks the browser to encode a tiny test image first and only offers the format if it succeeds.',
                'Re-encoding a JPG always loses a little detail, whatever quality you choose, because JPEG is lossy by design. Cropping and rotating are no exception.',
                'Metadata removal keeps the picture data byte for byte in JPG, PNG and WebP. Other containers are cleaned by writing a fresh file instead, which re-compresses the picture once.',
              ]}
            />
          </Section>

          <Faq items={FAQ} />
          <AboutSection />
        </article>
      </div>

      <JsonLd data={[websiteJsonLd(), faqJsonLd(FAQ)]} />
    </>
  );
}
