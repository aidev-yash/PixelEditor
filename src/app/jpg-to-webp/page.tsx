import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { ConvertTool } from '@/components/tools/ConvertTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'jpg-to-webp';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Convert JPG to WebP with a quality slider',
  'Live size comparison against the original',
  'Optional lossless WebP mode',
  'Encoder support verified before the option is offered',
  'Runs in the browser with no upload',
];

const FAQ: FaqItem[] = [
  {
    q: 'How much smaller will the WebP be?',
    a: 'For photographs at the same visible quality, typically 25 to 35 percent smaller than the JPG. The exact figure depends on the picture and on how hard the JPG was already compressed; a JPG saved at quality 60 has less left to give than one saved at 95. The readout shows the real number for your file rather than an average.',
  },
  {
    q: 'What quality should I use for JPG to WebP?',
    a: 'WebP quality numbers do not map one-to-one onto JPEG quality numbers, but 80 to 90 is a safe range for photographs going on a website. The default here is 88. Drag the slider and watch the size — the visual difference between 80 and 90 is small; the byte difference is not.',
  },
  {
    q: 'Which browsers and apps can open WebP?',
    a: 'Every current browser — Chrome, Edge, Firefox and Safari — has displayed WebP since 2020 or earlier. Modern operating systems preview it. The gaps are older desktop software, some email clients and a few upload forms that whitelist only JPG and PNG. For those, keep a JPG copy.',
  },
  {
    q: 'Should I use lossless WebP for a JPG?',
    a: 'Almost never. Lossless mode stores every pixel exactly, including the JPEG artefacts that are already in the picture, and the result is usually larger than the JPG. It exists for screenshots and flat graphics coming from PNG, not for photographs.',
  },
  {
    q: 'Why is the WebP option missing or greyed out?',
    a: 'Because this browser failed the encoder test. Before offering WebP the tool asks the browser to encode a tiny test image and checks the result. Every current desktop and mobile browser passes; if yours does not, updating it is the fix.',
  },
  {
    q: 'Is the JPG uploaded to convert it?',
    a: 'No. The JPG is decoded and the WebP encoded entirely inside this tab. No request carries the image; the only network traffic is the page itself.',
  },
];

export default function JpgToWebpPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={
        <ConvertTool
          to="image/webp"
          sourceLabel="JPG"
          expectedSource={['image/jpeg']}
        />
      }
      features={FEATURES}
      faq={FAQ}
      relatedIntro="WebP is one option among several for page weight. These pages cover the others."
    >
      <Section id="overview" eyebrow="Overview" title="The same picture in fewer bytes">
        <p>
          WebP is a newer format than JPEG with a better compressor behind it. At the quality
          levels websites actually use, it stores the same photograph in roughly a quarter to a
          third fewer bytes — which is why page-speed audits keep suggesting it. This page
          converts one JPG at a time, shows you the before and after sizes so you can see the
          saving on your own file, and lets you adjust the quality until you are happy with the
          trade.
        </p>
        <p>
          The encoding uses your browser’s own WebP encoder, which is checked before the option
          is offered. Nothing is uploaded, and the size you see is the size you download.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="What the converter does">
        <Steps
          items={[
            {
              title: 'Drop the JPG',
              detail:
                'The bytes are checked to confirm the format, the original size is shown, and any EXIF rotation is applied so the WebP comes out upright.',
            },
            {
              title: 'The encoder is verified',
              detail:
                'The page asks the browser to encode a tiny WebP test image. Only if that produces a real WebP is the conversion allowed to run.',
            },
            {
              title: 'Set the quality',
              detail:
                'The default is 88. Moving the slider re-encodes the image and updates the output size, so you can find the point where the saving stops being worth it.',
            },
            {
              title: 'Compare',
              detail:
                'The before and after previews sit side by side with their sizes. Compare a busy, detailed area in both to judge the quality yourself.',
            },
            {
              title: 'Download',
              detail: 'The file keeps its name with the extension changed to .webp.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="The controls">
        <DefinitionList
          items={[
            {
              term: 'Quality',
              detail:
                '1 to 100 in lossy mode. WebP degrades more gracefully than JPEG at the low end, so 75 in WebP often looks better than 75 in JPEG.',
            },
            {
              term: 'Lossless WebP',
              detail:
                'Stores every pixel exactly and hides the quality slider. For a JPG source this usually produces a file larger than the original; it is here for completeness, not as a recommendation.',
            },
            {
              term: 'Output',
              detail:
                'Fixed to WebP. The switcher above the article leads to the JPG-to-PNG and WebP-to-JPG pages if you need a different target.',
            },
            {
              term: 'Unexpected input',
              detail:
                'A PNG or WebP dropped here still converts. A WebP source is renamed with a “-converted” suffix so the original is not overwritten.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What to know before switching to WebP">
        <LimitList
          items={[
            'Compatibility is broad but not universal. A few older applications, email clients and upload forms still refuse WebP; keep the JPG if the destination is outside your control.',
            'Re-encoding is lossy. JPEG artefacts already in the source are carried into the WebP and a little more detail is lost on top. Converting from the original RAW or PNG, if you have it, gives a better WebP than converting from a JPG.',
            'Lossless WebP of a photograph is a large file. Use it for graphics, not for this.',
            'Metadata is dropped. The WebP has no EXIF, GPS or colour profile.',
            'The WebP option only appears where the browser proves it can encode it. This is nearly everywhere, but not guaranteed.',
            'Images over roughly 100 megapixels are refused because the canvas cannot usually be allocated.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="A 620 KB hero image to WebP for a landing page">
        <p>
          A 1920 × 1080 JPG exported at quality 85 weighs around 620 KB. Dropped here at the
          default quality of 88 it typically comes out between 380 KB and 450 KB with no
          difference a visitor would notice. Pulling the slider to 80 usually gets it under 350 KB;
          the readout shows the exact figure for your file at each step.
        </p>
        <p>
          When you have a whole folder of hero images, the{' '}
          <Link href="/batch-image-converter/" className="text-signal underline underline-offset-2">
            batch converter
          </Link>{' '}
          applies one quality setting to all of them and returns a ZIP. And if you need the WebP
          to hit a specific byte budget, the{' '}
          <Link href="/image-compressor/" className="text-signal underline underline-offset-2">
            compressor
          </Link>{' '}
          can search for it with WebP as the output.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why convert here">
        <BenefitList
          items={[
            {
              title: 'See the saving before you commit',
              detail:
                'The before and after sizes are both real encoded byte counts, updated as you move the quality slider.',
            },
            {
              title: 'Encoder verified, not assumed',
              detail:
                'The WebP option is only offered after the browser passes a real encode test, so you never download a file that is secretly a PNG.',
            },
            {
              title: 'No upload',
              detail:
                'A single conversion finishes in the time an upload would still be showing a progress bar.',
            },
            {
              title: 'Side-by-side preview',
              detail:
                'Original and WebP sit next to each other so you can judge quality with your own eyes rather than trusting a number.',
            },
            {
              title: 'Honest when it grows',
              detail:
                'If the WebP comes out larger — a heavily compressed source, or lossless mode on a photo — the readout says so.',
            },
            {
              title: 'No account, no watermark',
              detail: 'Nothing gates the download and nothing is added to the image.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="What happens to the JPG">
        <p>
          It is decoded in this tab and encoded as WebP on your device. No upload request is made
          to convert it, nothing is stored in local storage or a cache, and the decoded pixels are
          released when you load another file or close the page.
        </p>
        <p>
          The page sets no cookies and loads no analytics. Like any web page it is delivered by a
          server that can log the page request itself; the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          describes what that covers.
        </p>
      </Section>
    </ToolPage>
  );
}
