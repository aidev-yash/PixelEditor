import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { BatchResizeTool } from '@/components/tools/BatchResizeTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'batch-image-resizer';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Resize up to 50 images with one setting',
  'Fit in a box, set a width, or scale by percentage',
  'Keep each file’s format or convert them all',
  'Per-file results with sizes and dimensions',
  'Download individually or as one ZIP',
];

const FAQ: FaqItem[] = [
  {
    q: 'How many images can I resize at once?',
    a: 'Fifty per batch. The cap is deliberate: every image has to be decoded into memory, and a browser tab that runs out of it is killed by the browser. Drop more than fifty and the tool says how many were left out so you can run a second batch.',
  },
  {
    q: 'Can I resize a mix of portrait and landscape photos together?',
    a: 'Yes, and “Fit in box” is the mode for it. Each image is scaled until it fits inside the width and height you give, keeping its own shape — a portrait ends up tall and narrow inside the box, a landscape short and wide, and neither is stretched or cropped.',
  },
  {
    q: 'Will it enlarge images that are already small?',
    a: 'Not with “Never enlarge” on, which is the default in box mode. Files already smaller than the box are re-saved at their own size instead of being blown up, because enlarging adds no detail — it only adds blur and bytes.',
  },
  {
    q: 'Can I convert the formats while resizing?',
    a: '“Keep each” writes every file back in the format it arrived in, which is the default. Choose a specific format instead and the whole batch is written that way — useful for turning a mixed folder of PNG and JPG into WebP in one pass.',
  },
  {
    q: 'What happens if one file fails?',
    a: 'That row is marked with the reason and the queue carries on. A corrupt file or an unreadable format does not stop the other forty-nine, and the ZIP contains everything that succeeded.',
  },
  {
    q: 'Are the images uploaded for batch processing?',
    a: 'No. The queue runs in this tab, one file at a time, and the ZIP is assembled in the page as well. Nothing leaves the device at any point, which is why the batch size is limited by your own memory rather than by an upload quota.',
  },
];

export default function BatchImageResizerPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={<BatchResizeTool />}
      features={FEATURES}
      faq={FAQ}
      relatedIntro="The single-image version of this tool, and the other two batch pages."
    >
      <Section id="overview" eyebrow="Overview" title="One setting, a folder of images">
        <p>
          Resizing thirty photos by hand is thirty chances to fat-finger a number. This page takes
          the whole set, applies one rule to all of them and hands back the results with their new
          dimensions listed, so you can see at a glance that every file came out as intended.
        </p>
        <p>
          The rule is yours to pick: fit everything inside a box, give every file the same width, or
          scale everything by a percentage. The work runs on your device — the batch size is limited
          by the memory in your browser tab, not by an upload allowance or a paid tier.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="How the queue runs">
        <Steps
          items={[
            {
              title: 'Drop up to fifty images',
              detail:
                'Each file becomes a row in the queue. Duplicates of a file already in the list are ignored, and anything over the cap is reported rather than silently dropped.',
            },
            {
              title: 'Pick the resize rule',
              detail:
                'Fit in box, set width, or percentage. The same rule applies to every file in the batch.',
            },
            {
              title: 'Choose the output format',
              detail:
                '“Keep each” preserves the incoming formats. Pick one format instead and everything is written that way, with a shared quality setting for the lossy formats.',
            },
            {
              title: 'Run the queue',
              detail:
                'Files are processed one at a time — decoding several large photos at once is the fastest way to have the browser kill the tab. Progress, sizes and dimensions update as each finishes, and you can stop part-way.',
            },
            {
              title: 'Download',
              detail:
                'Take individual files from their rows, or the whole set as pixeleditor-resized.zip. The ZIP is built in the page from the finished files.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="The three modes and what they do to a mixed batch">
        <DefinitionList
          items={[
            {
              term: 'Fit in box',
              detail:
                'Give a maximum width and height; each image is scaled to fit inside both, keeping its own aspect ratio. The safest mode for mixed orientations. Defaults to 1600 × 1600.',
            },
            {
              term: 'Never enlarge',
              detail:
                'On by default in box mode. Images already smaller than the box keep their own size instead of being upscaled.',
            },
            {
              term: 'Set width',
              detail:
                'Every file gets exactly this width and the height follows its own ratio. Good for a uniform column of images; be aware that tall images will end up much taller than wide ones, which the tool warns about.',
            },
            {
              term: 'Percentage',
              detail:
                'Scales each image by the same proportion, whatever its starting size. 50 percent halves each side, so the pixel count drops to a quarter.',
            },
            {
              term: 'Output format',
              detail:
                '“Keep each” or one specific format for the whole batch. Formats are only offered after the browser proves it can encode them.',
            },
            {
              term: 'Quality',
              detail:
                'Applied to every lossy file in the batch; default 82. Hidden when the output is PNG, which is lossless.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="Honest limits of batching in a browser">
        <LimitList
          items={[
            'Fifty files per batch. Every decoded image needs width × height × 4 bytes of memory, so the cap protects the tab from being killed mid-run.',
            'One file at a time. Sequential processing is slower than parallel but far more reliable on phones and older laptops.',
            'One setting for the whole batch. Files needing individual treatment belong in the single-image resizer.',
            'Metadata is not carried across. Every output is written fresh, without EXIF, GPS or colour profile.',
            'Writing a batch of photographs as PNG makes the total larger, not smaller. The tool warns when PNG is selected.',
            'Individual images beyond roughly 100 megapixels are refused; that row reports the reason and the rest of the queue continues.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="Forty phone photos for a shared album">
        <p>
          Forty 4032 × 3024 photos straight off a phone come to roughly 140 MB. In box mode at
          1600 × 1600 with quality 82, each one lands around 250 KB to 450 KB and the total falls to
          somewhere near 14 MB — small enough to send in one go, large enough to look right on any
          screen. The readout shows the real before and after totals for your own files rather than
          these estimates.
        </p>
        <p>
          If the goal is a byte budget rather than a pixel size, the{' '}
          <Link href="/batch-image-compressor/" className="text-signal underline underline-offset-2">
            batch compressor
          </Link>{' '}
          aims at a target in kilobytes instead. For one image with exact dimensions, the{' '}
          <Link href="/image-resizer/" className="text-signal underline underline-offset-2">
            single resizer
          </Link>{' '}
          gives you more control per file.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why batch here">
        <BenefitList
          items={[
            {
              title: 'No upload wait',
              detail:
                'Forty photos would be a long upload and a long download. Here there is neither — the files are already where the work happens.',
            },
            {
              title: 'Per-file accountability',
              detail:
                'Every row shows its output dimensions and size, so an odd result is visible immediately rather than discovered later.',
            },
            {
              title: 'Failures stay contained',
              detail:
                'A bad file marks its own row and the queue continues. You never lose a whole run to one corrupt image.',
            },
            {
              title: 'One ZIP at the end',
              detail:
                'Packaged in the browser from the finished files, so there is nothing to wait for and nothing stored on a server.',
            },
            {
              title: 'Mixed batches handled properly',
              detail:
                'Box mode gives portraits and landscapes the same maximum footprint without stretching or cropping either.',
            },
            {
              title: 'No account, no watermark, no queue',
              detail:
                'Nothing is limited by a plan. The only limit is the memory in your own tab, and it is stated plainly.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="Where a batch of images goes">
        <p>
          Nowhere. Each file is decoded, resized and re-encoded in this tab, and the ZIP is built
          here too. No upload request is made, nothing is written to local storage, a cache or a
          cookie, and the queue exists only in the page — reloading clears it.
        </p>
        <p>
          The page sets no cookies and loads no analytics. The host that served it can log the page
          request, as every web host can; the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          describes that and makes no broader claim.
        </p>
      </Section>
    </ToolPage>
  );
}
