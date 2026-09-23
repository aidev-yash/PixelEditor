import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { BatchConvertTool } from '@/components/tools/BatchConvertTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'batch-image-converter';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Convert up to 50 images to one format at once',
  'JPG, PNG and WebP, plus AVIF where the browser supports it',
  'Lossless WebP option and a background colour for JPG output',
  'Flags files that came out larger than the original',
  'Download individually or as one ZIP',
];

const FAQ: FaqItem[] = [
  {
    q: 'Can I convert a folder with mixed formats?',
    a: 'Yes — that is what this page is for. Drop JPG, PNG and WebP files together and every one of them is written out as the single format you choose. The incoming formats do not need to match each other.',
  },
  {
    q: 'Which formats can I convert to?',
    a: 'JPG and PNG always. WebP and AVIF appear only after this browser has proved it can encode them, by writing a tiny test image and checking the result. That is why AVIF shows up in some browsers and not others — the option is never offered on a promise.',
  },
  {
    q: 'What happens to transparency?',
    a: 'PNG, WebP and AVIF keep it. JPG cannot, so when JPG is the target every transparent pixel in the batch is filled with the background colour you pick, and the tool says so before you run.',
  },
  {
    q: 'Why did some files come out larger?',
    a: 'Usually because a compressed photograph was written to a lossless format — PNG, or WebP with lossless mode on. The tool counts those files and marks each row, so you know which ones to leave as they were.',
  },
  {
    q: 'What if some files are already in the target format?',
    a: 'They are still processed, and their downloads get a “-converted” suffix so they cannot be confused with your originals. The tool tells you how many are in that position, because re-encoding a file into its own format never improves it.',
  },
  {
    q: 'Are the files uploaded to be converted?',
    a: 'No. Every conversion runs in this tab, one file at a time, and the ZIP is built in the page. Nothing leaves the device.',
  },
];

export default function BatchImageConverterPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={<BatchConvertTool />}
      features={FEATURES}
      faq={FAQ}
      relatedIntro="The one-file conversion pages, and the other batch tools that share this queue."
    >
      <Section id="overview" eyebrow="Overview" title="One format, however mixed the folder">
        <p>
          Folders accumulate formats. A few JPGs from a camera, screenshots saved as PNG, images
          pulled from a website as WebP — and then something downstream wants them all the same. A
          content system that only accepts JPG, a build pipeline that wants WebP, a client who asked
          for PNG. This page takes the mixed set and writes every file out in the one format you
          choose.
        </p>
        <p>
          The format list is not a menu of promises: JPG and PNG are always there, and WebP and AVIF
          appear only once this browser has demonstrated it can encode them. Everything runs on your
          own device.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="How the conversion runs">
        <Steps
          items={[
            {
              title: 'Drop up to fifty images',
              detail:
                'Mixed formats are expected. Each file becomes a row with its original size; duplicates are ignored and anything over the cap is reported.',
            },
            {
              title: 'Pick the target format',
              detail:
                'The browser is asked to encode a tiny test image in each candidate format first, so only formats it can genuinely write are listed.',
            },
            {
              title: 'Set quality, or not',
              detail:
                'Lossy targets get one quality slider for the whole batch, default 85. PNG and lossless WebP have no quality setting because nothing is discarded.',
            },
            {
              title: 'Run the queue',
              detail:
                'Files are converted one at a time so the tab does not run out of memory. Each row shows its finished size, and anything that grew is marked.',
            },
            {
              title: 'Download',
              detail:
                'Single files from their rows, or the whole set as a ZIP named after the target format — pixeleditor-webp.zip, pixeleditor-jpg.zip and so on.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="The controls">
        <DefinitionList
          items={[
            {
              term: 'Output format',
              detail:
                'JPG, PNG, and WebP or AVIF where the browser proved it can encode them. WebP is the default because it suits the largest number of jobs.',
            },
            {
              term: 'Quality',
              detail:
                'One setting for every lossy file in the batch, default 85. 80 to 90 keeps photographs close to their originals.',
            },
            {
              term: 'Lossless WebP',
              detail:
                'Shown when WebP is the target. Keeps every pixel — right for screenshots and flat graphics, usually much larger for photographs.',
            },
            {
              term: 'Fill colour',
              detail:
                'Shown when JPG is the target. Transparent areas in PNG, WebP or AVIF sources are blended onto this colour, because JPG has no alpha channel.',
            },
            {
              term: 'Total before / after',
              detail:
                'Running byte totals across the finished files, so you can see whether the conversion actually saved anything.',
            },
            {
              term: 'Per-file remarks',
              detail:
                'A row is marked when its output is larger than the original, with both sizes shown.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What to watch for">
        <LimitList
          items={[
            'Fifty files per batch, because each decoded image occupies width × height × 4 bytes of memory in the tab.',
            'One format and one quality for the whole batch. Files needing individual treatment belong on the single conversion pages.',
            'Converting to JPG discards transparency permanently, filling it with the background colour.',
            'Converting a lossy image to PNG or lossless WebP makes it larger while adding no quality. Those rows are flagged.',
            'AVIF encodes slowly. A large batch to AVIF can take several minutes, and the option only appears where the browser supports it.',
            'Metadata is not carried across. Every output is a fresh file with no EXIF, GPS or colour profile.',
            'Animated GIF and WebP are converted as their first frame only; these are still-image tools.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="A mixed asset folder to WebP">
        <p>
          Say the folder holds twenty JPG photographs averaging 1.2 MB and ten PNG screenshots
          averaging 900 KB — about 33 MB in total. Converting everything to WebP at quality 85, the
          photographs typically fall by a quarter to a third, and the screenshots by half or more,
          bringing the folder to somewhere around 15 MB with transparency intact on anything that
          had it. The totals shown in the workspace are measured from your actual files.
        </p>
        <p>
          If the screenshots need to stay pixel-exact, run them separately with{' '}
          <Link href="/png-to-webp/" className="text-signal underline underline-offset-2">
            PNG to WebP
          </Link>{' '}
          in lossless mode. If the goal is a size limit rather than a format, the{' '}
          <Link href="/batch-image-compressor/" className="text-signal underline underline-offset-2">
            batch compressor
          </Link>{' '}
          aims at kilobytes instead.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why convert a batch here">
        <BenefitList
          items={[
            {
              title: 'Formats verified, not assumed',
              detail:
                'WebP and AVIF are offered only after a real test encode in this browser, so a batch never ends in fifty files of the wrong type.',
            },
            {
              title: 'Mixed input, single output',
              detail:
                'No sorting by format first. Drop the folder as it is and everything comes back consistent.',
            },
            {
              title: 'Honest about growth',
              detail:
                'Files that came out larger are counted and marked, rather than being buried in a ZIP for you to discover later.',
            },
            {
              title: 'No upload, no quota',
              detail:
                'Thirty megabytes of assets would be a slow round trip to a server. Here there is no trip at all.',
            },
            {
              title: 'Names kept sensible',
              detail:
                'Each file keeps its name with a new extension, collisions are resolved automatically, and files already in the target format get a “-converted” suffix.',
            },
            {
              title: 'One ZIP, built in the page',
              detail:
                'Packaged in the browser from the finished files, with nothing stored anywhere else.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="Where the batch runs">
        <p>
          In this tab, on your device. Every file is decoded and re-encoded here, and the ZIP is
          assembled here too. No upload request is made, nothing is written to local storage, a cache
          or a cookie, and the queue is gone when you reload or close the page.
        </p>
        <p>
          The page sets no cookies and loads no analytics. The host that served it can log the page
          request itself, as every web host can; the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          sets that out and claims nothing beyond it.
        </p>
      </Section>
    </ToolPage>
  );
}
