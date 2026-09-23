import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { ConvertTool } from '@/components/tools/ConvertTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'png-to-webp';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Convert PNG to WebP in lossless or lossy mode',
  'Alpha channel preserved either way',
  'Quality slider for lossy mode',
  'Live size comparison against the original',
  'Runs in the browser with no upload',
];

const FAQ: FaqItem[] = [
  {
    q: 'Does WebP keep PNG transparency?',
    a: 'Yes, in both modes. Lossless WebP stores the alpha channel exactly; lossy WebP compresses the colour data but keeps transparency intact. This is the main reason to choose WebP over JPG when a PNG has a see-through background.',
  },
  {
    q: 'Lossless or lossy — which should I pick?',
    a: 'Lossless for screenshots, icons, logos, diagrams and anything with text or hard edges; you get a file that is pixel-identical to the PNG and usually a quarter to a half smaller. Lossy for photographs saved as PNG, where the exactness was never needed and the saving is dramatic — often 80 to 90 percent.',
  },
  {
    q: 'How much smaller is lossless WebP than PNG?',
    a: 'It varies with the image. Screenshots and flat graphics typically shrink by 25 to 50 percent. Very small images or ones that were already heavily optimised may shrink less, and occasionally not at all — the readout tells you the real result, and warns if the WebP is larger.',
  },
  {
    q: 'Why does my lossy WebP have slight halos around text?',
    a: 'Because lossy compression blurs sharp edges, and text is nothing but sharp edges. Switch to lossless for any PNG that contains text or line art. The file will be larger than lossy but still smaller than the PNG.',
  },
  {
    q: 'Will semi-transparent pixels, like soft shadows, survive?',
    a: 'Yes. WebP alpha is eight bits per pixel, the same as PNG, so soft shadows, feathered edges and anti-aliased outlines keep their partial transparency.',
  },
  {
    q: 'Is the PNG uploaded to convert it?',
    a: 'No. The file is decoded and re-encoded as WebP inside this tab. No request carries the image, which you can confirm from the browser’s network panel while the tool runs.',
  },
];

export default function PngToWebpPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={
        <ConvertTool
          to="image/webp"
          sourceLabel="PNG"
          expectedSource={['image/png']}
        />
      }
      features={FEATURES}
      faq={FAQ}
      relatedIntro="The conversions on either side of this one, and the batch page that does it for a whole folder."
    >
      <Section id="overview" eyebrow="Overview" title="Smaller than PNG, transparency intact">
        <p>
          PNG earned its place by being exact and by supporting transparency, and it pays for
          both with size. WebP offers the same two guarantees in lossless mode at a noticeably
          smaller size, and in lossy mode trades the exactness away for a file that is often a
          tenth of the PNG — while still keeping the alpha channel. That combination is why WebP is
          the usual answer when a PNG with a transparent background is too heavy for a web page.
        </p>
        <p>
          This page converts one PNG at a time in your browser, lets you switch between the two
          modes, and shows the resulting size for each so the decision is made on evidence.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="What happens to the PNG">
        <Steps
          items={[
            {
              title: 'Drop the PNG',
              detail:
                'The tool confirms the format from the file bytes and reads the header to learn whether the image carries an alpha channel.',
            },
            {
              title: 'Choose lossless or lossy',
              detail:
                'Lossless keeps every pixel and hides the quality slider. Lossy exposes the slider and compresses the colour data, keeping transparency.',
            },
            {
              title: 'The WebP is encoded',
              detail:
                'The browser’s own WebP encoder — verified with a test encode before it is offered — writes the file with the alpha channel included.',
            },
            {
              title: 'Sizes are compared',
              detail:
                'The readout shows the PNG and WebP byte counts and the percentage change. Switch modes to see both figures for your image.',
            },
            {
              title: 'Download',
              detail: 'The file keeps its name with the extension changed to .webp.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="The two modes and one slider">
        <DefinitionList
          items={[
            {
              term: 'Lossless WebP',
              detail:
                'Off by default. Turn it on for screenshots, icons, diagrams and anything with text. Output is pixel-identical to the PNG.',
            },
            {
              term: 'Quality',
              detail:
                'Shown in lossy mode only, 1 to 100, default 88. For a photograph saved as PNG, 80 to 90 is generous; the saving over the PNG is enormous either way.',
            },
            {
              term: 'Output',
              detail:
                'Fixed to WebP. The switcher leads to PNG-to-JPG if the destination cannot read WebP — bearing in mind JPG loses the transparency.',
            },
            {
              term: 'Unexpected input',
              detail:
                'A JPG or WebP dropped here still converts. A WebP source is renamed with a “-converted” suffix so the original is not replaced.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="Where WebP may not be the answer">
        <LimitList
          items={[
            'Compatibility is broad but not universal. A few older applications and some upload forms still refuse WebP. Keep the PNG if the destination is outside your control.',
            'Lossless WebP is not guaranteed to be smaller. Tiny images and already-optimised PNGs occasionally come out larger; the readout warns when that happens.',
            'Lossy mode softens edges. Text, line art and pixel art need lossless mode to look right.',
            'Animated PNG (APNG) is flattened to its first frame; this is a still-image tool.',
            'Metadata is dropped. PNG text chunks and colour profiles are not carried across.',
            'Images over roughly 100 megapixels are refused because the canvas allocation normally fails.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="A 340 KB transparent logo and a 4 MB screenshot">
        <p>
          A 1200 × 400 logo on a transparent background saved as PNG might weigh 340 KB. In
          lossless mode it typically becomes 150 KB to 220 KB, pixel-identical, transparency
          intact. Lossy mode would take it below 60 KB, but the edges of the lettering would
          soften — for a logo, lossless is the right choice.
        </p>
        <p>
          A 4 MB PNG screenshot of a photo-heavy page is the opposite case: lossy at quality 85
          brings it to around 300 KB with nothing a viewer would notice, while lossless lands
          nearer 2.5 MB. If a folder of such screenshots needs the same treatment, the{' '}
          <Link href="/batch-image-converter/" className="text-signal underline underline-offset-2">
            batch converter
          </Link>{' '}
          applies one setting to all of them.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why convert here">
        <BenefitList
          items={[
            {
              title: 'Transparency survives',
              detail:
                'The alpha channel is carried into the WebP in both modes. There is no background colour to choose because none is needed.',
            },
            {
              title: 'Both modes on one page',
              detail:
                'Flip between lossless and lossy and read the size of each. The right mode is obvious once you see the numbers.',
            },
            {
              title: 'Verified encoder',
              detail:
                'The WebP option is only offered after the browser passes a real test encode, so the file you download is a genuine WebP.',
            },
            {
              title: 'Real byte counts',
              detail:
                'Every size shown is measured from the finished file, and the tool warns if the WebP came out larger.',
            },
            {
              title: 'No upload',
              detail:
                'Screenshots of dashboards, chats and documents are exactly the files that should not go to a server to be converted.',
            },
            {
              title: 'No account, no watermark',
              detail: 'Nothing is gated and nothing is added to the image.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="Where the conversion runs">
        <p>
          In this tab, on your device. The PNG is decoded and the WebP encoded in memory; no
          upload request is made in order to convert it. Nothing is written to local storage, a
          cache or a cookie, and closing the page releases the image.
        </p>
        <p>
          No cookies are set and no analytics run. The host that delivered the page can log the
          page request itself, as every host can; the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          describes that precisely.
        </p>
      </Section>
    </ToolPage>
  );
}
