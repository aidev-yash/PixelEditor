import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { ResizerTool } from '@/components/tools/ResizerTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'image-resizer';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Resize to exact pixel width and height',
  'Scale by percentage',
  'Fit inside a bounding box without distortion',
  'Aspect ratio locked by default',
  'Runs in the browser with no upload',
];

const FAQ: FaqItem[] = [
  {
    q: 'How do I resize an image to exact pixel dimensions?',
    a: 'Choose the “Exact size” mode, type the width you need, and leave the ratio locked so the height follows. If you need both numbers to be exact and they do not match the original ratio, unlock the ratio — the picture will stretch, which is usually not what you want. Fitting inside a box is the better option in that case.',
  },
  {
    q: 'Will resizing make my image blurry?',
    a: 'Making an image smaller is safe: detail is discarded, and the result stays sharp because the downscale is done in halving steps rather than one jump. Making it larger cannot add detail that was never captured, so an enlarged image always looks softer. That is why “Do not enlarge” is on by default.',
  },
  {
    q: 'Does resizing reduce the file size too?',
    a: 'Almost always, because fewer pixels need fewer bytes. How much smaller depends on the format and quality you write. If a specific file size is what you actually need, the compressor lets you name a target in KB instead of guessing at dimensions.',
  },
  {
    q: 'Can I resize a PNG without losing transparency?',
    a: 'Yes. Keep the output format as PNG or WebP and the alpha channel is carried through the resize. Writing the result as JPG is the one case where transparency is lost, because JPEG has no alpha channel — transparent areas become solid.',
  },
  {
    q: 'What is the largest image I can resize here?',
    a: 'The limit is your device, not a plan. Anything beyond roughly 100 megapixels is refused up front because the browser usually fails to allocate a canvas that large. In practice a 50-megapixel photo is fine on a desktop; on an older phone, expect trouble well before that.',
  },
  {
    q: 'Is the resized image uploaded anywhere?',
    a: 'No. The file is decoded, redrawn at the new size and re-encoded inside this tab. No request carrying the image is made, which you can verify in your browser’s network panel while the tool runs.',
  },
];

export default function ImageResizerPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={<ResizerTool />}
      features={FEATURES}
      faq={FAQ}
      relatedIntro="Resizing is usually one step in a longer job. These tools handle the steps either side of it."
    >
      <Section id="overview" eyebrow="Overview" title="Resizing without handing over the file">
        <p>
          Most resizing jobs are small and specific: a photo has to be 1200 pixels wide for a blog
          post, an avatar has to be exactly 400 × 400, a scan is four times larger than the form
          that wants it. None of those need a server. Your browser already decodes the image to
          display it, and it can redraw it at a different size just as easily — so this tool does
          the work here, on your device, and hands you the file back.
        </p>
        <p>
          The practical difference is that there is no upload wait and no copy of your picture
          sitting in someone else’s queue. For a holiday snap that hardly matters. For a scanned
          contract, a medical image or an unreleased product shot, it matters a great deal.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="What the resizer does with your file">
        <Steps
          items={[
            {
              title: 'Pick an image',
              detail:
                'Drag a file onto the drop area or browse for it. The original dimensions, byte size and true format appear straight away, read from the file itself rather than its extension.',
            },
            {
              title: 'Choose how to describe the new size',
              detail:
                'Exact pixels, a percentage of the original, or a bounding box the image must fit inside. Each suits a different kind of request.',
            },
            {
              title: 'Type your numbers',
              detail:
                'With the ratio locked, filling in one side calculates the other. The preview updates as you type, so you can see the result before committing to it.',
            },
            {
              title: 'Check the output line',
              detail:
                'The readout shows the real output dimensions and the real encoded size — measured from the finished file, not estimated from the settings.',
            },
            {
              title: 'Download',
              detail:
                'The file is saved with a name that records the new dimensions, so a folder of resized images stays readable later.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="What each control does">
        <DefinitionList
          items={[
            {
              term: 'Exact size',
              detail:
                'You give a width, a height, or both. With one field filled and the ratio locked, the other is derived. This is the mode for “must be exactly 1080 wide”.',
            },
            {
              term: 'Fit in box',
              detail:
                'You give a maximum width and height; the image is scaled down until it fits inside both, keeping its proportions. Nothing is cropped and nothing is stretched. Best for “no bigger than 1600 in either direction”.',
            },
            {
              term: 'Percentage',
              detail:
                'Scales both sides by the same factor. Handy for a batch of screenshots at 50%, or for halving a retina export.',
            },
            {
              term: 'Lock aspect ratio',
              detail:
                'On by default. Turning it off lets the image stretch, which is occasionally deliberate — for a texture or a banner — and usually a mistake for a photograph.',
            },
            {
              term: 'Do not enlarge',
              detail:
                'Stops a small image from being scaled up past its own resolution. Enlarging invents pixels, so it can only ever soften the picture.',
            },
            {
              term: 'Output format',
              detail:
                'Keep the original format, or write JPG, PNG or WebP. Only formats this browser proves it can encode are offered — the option is hidden rather than failing later.',
            },
            {
              term: 'Quality',
              detail:
                'Shown for lossy formats only. Controls how much detail the encoder discards. The slider starts at 82, which suits photographs; screenshots and flat graphics usually want more.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What it reads, writes and refuses">
        <p>
          It reads whatever your browser can decode — JPG, PNG, WebP, GIF, BMP and usually AVIF —
          and writes JPG and PNG everywhere, WebP in every current browser, and AVIF only where the
          browser passes an encoder test first.
        </p>
        <LimitList
          items={[
            'Enlarging cannot recover detail. A 400-pixel image scaled to 1600 will look soft however it is done; there is no AI upscaling here.',
            'Images beyond roughly 100 megapixels are refused, because the canvas allocation normally fails at that size.',
            'Animated GIF and animated WebP are reduced to their first frame — this is a still-image tool.',
            'Writing a JPG from a transparent source fills the transparent areas with a solid colour, because JPEG cannot store an alpha channel.',
            'Re-encoding a JPG loses a little detail even at high quality. Resizing a JPG means re-encoding it, so repeated round-trips accumulate.',
            'Metadata is not carried into the resized file. If you need EXIF preserved, this is not the tool; if you want it gone deliberately, that is the point of the EXIF remover.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="A 4000-pixel photo down to a 1200-pixel blog image">
        <p>
          A phone photograph at 4000 × 3000 and 4.2 MB is far larger than any blog layout needs.
          Choosing <strong>Exact size</strong>, typing <strong>1200</strong> into the width and
          leaving the ratio locked gives a height of 900. The pixel count drops to about a tenth of
          the original, and the file written as JPG at quality 80 typically lands somewhere between
          150 KB and 400 KB depending on how busy the picture is.
        </p>
        <p>
          The readout shows the real figure rather than that estimate. If it is still heavier than
          your budget, send the result through the{' '}
          <Link href="/image-compressor/" className="text-signal underline underline-offset-2">
            image compressor
          </Link>{' '}
          with a target in KB, or write it as WebP, which usually reaches the same visual quality
          in fewer bytes.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why resize here rather than in an online editor">
        <BenefitList
          items={[
            {
              title: 'No upload step',
              detail:
                'Work starts the moment you drop the file. A 20 MB image does not have to cross the network before anything happens.',
            },
            {
              title: 'Stepped downscaling',
              detail:
                'Large reductions are done in halving steps rather than one jump, which avoids the jagged edges a single-pass resize produces.',
            },
            {
              title: 'The numbers are real',
              detail:
                'Output dimensions and byte size are measured from the finished file, so what you see is what downloads.',
            },
            {
              title: 'Sensible defaults',
              detail:
                'Ratio locked, no enlargement, format kept. The common case needs one number typed and nothing else touched.',
            },
            {
              title: 'Nothing to sign up for',
              detail:
                'No account, no watermark, no daily limit. Close the tab and there is nothing left behind.',
            },
            {
              title: 'Keyboard-friendly',
              detail:
                'Every control is a real form field with a visible label, so the whole tool works without a mouse.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="What happens to the image you resize">
        <p>
          The file is read into this tab’s memory, redrawn onto a canvas at the new size, and
          encoded back into an image. That is the whole journey. No upload request is made in order
          to resize, nothing is written to local storage or a cache, and the decoded pixels are
          released when you load another file or close the tab.
        </p>
        <p>
          This page sets no cookies and loads no analytics. As with any web page, the server that
          delivered it can log the request itself — an IP address, a timestamp, a user-agent — and
          the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          says so plainly rather than claiming otherwise.
        </p>
      </Section>
    </ToolPage>
  );
}
