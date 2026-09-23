import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { CompressorTool } from '@/components/tools/CompressorTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'image-compressor';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Compress by quality level',
  'Compress to a target file size in KB',
  'Optional dimension reduction when quality alone is not enough',
  'Real before and after byte counts',
  'Output as JPG, PNG, WebP or AVIF where supported',
  'Runs in the browser with no upload',
];

const FAQ: FaqItem[] = [
  {
    q: 'How do I compress an image to under 100 KB?',
    a: 'Switch to “Target size”, type 100, and leave “Reduce dimensions if needed” on. The tool encodes the image at several quality levels to find the highest one that fits, and if even the lowest quality is still too big it shrinks the image in steps and tries again. The readout tells you which quality and size it landed on.',
  },
  {
    q: 'What quality setting should I use?',
    a: 'For photographs on the web, 70 to 80 is the usual range: visibly identical to the original at normal viewing sizes, and typically a third to a half of the bytes. Below 60 the loss starts to show in smooth gradients and around sharp edges. Above 90 the file grows quickly for very little visible gain.',
  },
  {
    q: 'Why did the file get bigger instead of smaller?',
    a: 'Because the original was already compressed harder than the settings you chose. Re-encoding at quality 80 a JPG that was saved at quality 60 produces a larger file with no more detail. The tool says so in the readout when this happens; keep the original in that case, or lower the quality.',
  },
  {
    q: 'Can I compress a PNG without losing quality?',
    a: 'Only slightly. PNG is lossless, so the encoder cannot throw detail away, and the browser’s PNG encoder does not expose a compression-effort setting. If the picture is a photograph, writing it as JPG or WebP will be far smaller; if it is a screenshot or flat graphic, lossless WebP usually beats PNG while staying pixel-exact.',
  },
  {
    q: 'Is WebP better than JPG for compression?',
    a: 'Usually, yes — at the same visible quality WebP is typically 25 to 35 percent smaller than JPG, and it keeps transparency. The trade-off is compatibility: some older software and a few upload forms still refuse WebP. If the file is going somewhere you do not control, JPG remains the safe choice.',
  },
  {
    q: 'Is the image uploaded to be compressed?',
    a: 'No. The image is decoded and re-encoded inside this tab. In target mode it may be encoded a dozen times in the search, and every one of those encodes happens on your device — there is no server involved.',
  },
];

export default function ImageCompressorPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={<CompressorTool />}
      features={FEATURES}
      faq={FAQ}
      relatedIntro="Compression pairs naturally with a resize or a format change. These tools cover both."
    >
      <Section id="overview" eyebrow="Overview" title="Two ways to describe “smaller”">
        <p>
          Sometimes you know what quality you can accept; sometimes you only know the number the
          form will reject you at. A quality slider answers the first question and a target size
          answers the second, and most compressors only offer one of them. This tool has both.
          In quality mode you pick a level and see the resulting size. In target mode you name a
          size in KB and the tool searches for the best quality that fits — shrinking the
          dimensions too, if you allow it, when quality alone will not get there.
        </p>
        <p>
          Every encode in that search runs in your browser. The numbers on the readout are the
          real byte counts of the finished files, and if a target cannot be met the tool says so
          rather than handing you a file that is quietly too large.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="What the compressor does">
        <Steps
          items={[
            {
              title: 'Drop an image',
              detail:
                'The original size and true format appear at once. This is the “before” half of every figure that follows.',
            },
            {
              title: 'Pick quality or target',
              detail:
                'Quality mode encodes once at the level you set. Target mode runs a search: it first tries a high quality, then the lowest, and if the answer lies between them it bisects that range until it finds the highest quality that still fits.',
            },
            {
              title: 'Let it downscale if needed',
              detail:
                'If the lowest acceptable quality still exceeds the target, the tool reduces the dimensions by a fifth and searches again, up to four times. The readout reports any reduction.',
            },
            {
              title: 'Read the result',
              detail:
                'Output size, the percentage saved, the quality it settled on, and whether the target was met. A file that came out no smaller is flagged rather than hidden.',
            },
            {
              title: 'Download',
              detail:
                'The compressed file is named with a suffix so it sits next to the original instead of replacing it.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="Each control, explained">
        <DefinitionList
          items={[
            {
              term: 'Compress by: Quality',
              detail:
                'A single encode at the quality you choose. Fast, predictable, and the right mode when you care about how the picture looks more than its exact size.',
            },
            {
              term: 'Compress by: Target size',
              detail:
                'A search for the largest quality that lands under your KB figure. Slower, because it encodes several times, and the right mode when a form or a platform has a hard limit.',
            },
            {
              term: 'Quality',
              detail:
                'Ranges from 1 to 100 for lossy formats. 75 is the default. The slider is hidden when the output format is PNG, because PNG has no quality to trade.',
            },
            {
              term: 'Target file size',
              detail:
                'In KB, from 5 to 20 000. The tool aims for at or under this figure; it will not overshoot and call it close enough.',
            },
            {
              term: 'Reduce dimensions if needed',
              detail:
                'When on, a target that cannot be reached at any quality is retried at smaller dimensions. When off, the tool reports the miss and leaves the size alone.',
            },
            {
              term: 'Output format',
              detail:
                'Keep the source format, or write JPG, PNG, WebP — or AVIF, when this browser passes the encoder test. Changing format is often the single biggest saving available.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What compresses well and what does not">
        <p>
          The compressor reads JPG, PNG, WebP, GIF, BMP and usually AVIF, and writes JPG, PNG and
          WebP, plus AVIF where the browser can encode it.
        </p>
        <LimitList
          items={[
            'PNG output has no quality setting. Writing a photograph as PNG will almost always produce a larger file than the JPG you started with.',
            'A very small target on a very detailed image may be impossible without shrinking it. With downscaling off, the tool reports the smallest size it could reach instead of pretending.',
            'Target mode encodes the image several times — up to seven passes per size step — so a large photo on a slow device takes a few seconds rather than a fraction of one.',
            'Re-encoding a lossy file always loses a little more detail. Compressing a JPG three times in a row is worse than compressing the original once to the final settings.',
            'Metadata is dropped. EXIF, GPS and colour profiles are not carried into the compressed file, which also shaves a few KB.',
            'Images over roughly 100 megapixels are refused because the canvas allocation normally fails.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="A 3.8 MB phone photo to under 200 KB for a job application">
        <p>
          Application portals commonly cap uploads at 200 KB. A 3.8 MB, 4000 × 3000 phone
          photograph in target mode with <strong>200</strong> in the box and downscaling on goes
          through this sequence: a high-quality encode at the full size comes out far too large;
          the lowest-quality encode is tried next, and on a detailed 12-megapixel photo it usually
          misses too. So the tool reduces the image to 3200 × 2400 and repeats. Somewhere between
          that step and 2560 × 1920 the lowest quality fits, and the bisection then climbs back up
          to the highest quality that still lands under 200 KB.
        </p>
        <p>
          The readout would show the final dimensions, the quality it settled on, and “target
          met”. The result is sharp at any screen size a reviewer will view it at, because 2560
          pixels wide is still far larger than the box on their screen. If you would rather
          control the dimensions yourself first, the{' '}
          <Link href="/image-resizer/" className="text-signal underline underline-offset-2">
            image resizer
          </Link>{' '}
          gets the pixel count down before compression takes over.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="What sets this compressor apart">
        <BenefitList
          items={[
            {
              title: 'A real target mode',
              detail:
                'Name the size you need and let the search find it. Most tools make you guess a quality and re-check the result by hand.',
            },
            {
              title: 'Honest about misses',
              detail:
                'If the target cannot be reached, the readout says so and reports the smallest size achieved. There is no silent overshoot.',
            },
            {
              title: 'Measured, not estimated',
              detail:
                'Every size shown is the byte length of a finished encode. The percentage saved is calculated from the file you will download.',
            },
            {
              title: 'Format is part of the answer',
              detail:
                'Switching JPG to WebP is often the largest saving available, and the tool lets you compare it on the spot.',
            },
            {
              title: 'Works on the device',
              detail:
                'Even a dozen search encodes of a large photo finish faster than uploading it once. And nothing has to be deleted afterwards.',
            },
            {
              title: 'No limits per day',
              detail:
                'No account and no quota. Compress one file or a hundred, one after another.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="Where the encoding happens">
        <p>
          On your device, in this tab. The image is decoded once and encoded as many times as the
          search needs, all in memory. No upload request is made in order to compress it. Nothing
          is written to local storage or a cache, and nothing survives the tab closing.
        </p>
        <p>
          The page sets no cookies and runs no analytics. As with every website, the server that
          delivered the page can log the page request itself; the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          describes what that involves and what it does not.
        </p>
      </Section>
    </ToolPage>
  );
}
