import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { BatchCompressTool } from '@/components/tools/BatchCompressTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'batch-image-compressor';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Compress up to 50 images in one pass',
  'One quality setting, or a target size in KB per file',
  'Optional downscaling when quality alone cannot reach the target',
  'Per-file remarks when a target is missed',
  'Download individually or as one ZIP',
];

const FAQ: FaqItem[] = [
  {
    q: 'Can I compress every image to the same file size?',
    a: 'Target mode aims each file at the KB figure you set, searching per file for the highest quality that fits. It is not a guarantee: a large, detailed photograph may not reach a very small target at any quality. When that happens the row says so and gives the smallest size that file would encode to, rather than pretending it succeeded.',
  },
  {
    q: 'Quality mode or target mode — which should I use?',
    a: 'Quality mode when you care about consistent visual quality and can accept varying file sizes; it is also much faster, because each file is encoded once. Target mode when a hard limit has to be met — an upload cap, an email attachment, a form that rejects anything over 500 KB — and you can accept that quality varies between files.',
  },
  {
    q: 'Why is target mode slower?',
    a: 'Because each file is encoded several times. The search starts at a high quality, checks the resulting byte count, then narrows towards the target — up to seven passes per file, and more if dimensions have to be reduced as well. Fifty files in target mode is a noticeably longer run than fifty in quality mode.',
  },
  {
    q: 'What does “Reduce dimensions if needed” do?',
    a: 'When quality alone cannot get a file under the target, that file is scaled down in steps and the quality search runs again at the smaller size. It is on by default because a slightly smaller image that meets the limit is usually more useful than a full-size one that does not. The row tells you the dimensions it settled on.',
  },
  {
    q: 'Some files came out larger than the originals. Why?',
    a: 'Because they were already compressed harder than your settings. Re-encoding an image that is already at quality 60 with a setting of 75 makes it bigger, not smaller. The tool flags those rows and counts them, so you can keep the originals for that handful of files.',
  },
  {
    q: 'Are the images uploaded to be compressed?',
    a: 'No. The whole queue runs in this tab and the ZIP is assembled here as well. No request carries any of the files.',
  },
];

export default function BatchImageCompressorPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={<BatchCompressTool />}
      features={FEATURES}
      faq={FAQ}
      relatedIntro="The single-image compressor, and the other batch pages that share the same queue."
    >
      <Section id="overview" eyebrow="Overview" title="A folder of images, under the limit">
        <p>
          The reason to compress a batch is almost always an external limit: an email that bounces
          over 25 MB, a content system that rejects anything above 500 KB, a site that has grown too
          heavy to load on a phone. This page applies one compression rule to as many as fifty
          images and reports what each one actually achieved — including the ones that could not
          reach the target, because a tool that hides those is no use when the limit is real.
        </p>
        <p>
          Nothing is uploaded. Fifty photographs would be a long wait in both directions; here the
          files are already on the device that does the work.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="How the batch is compressed">
        <Steps
          items={[
            {
              title: 'Drop up to fifty images',
              detail:
                'Each becomes a row in the queue with its original size. Duplicates are ignored and anything over the cap is reported rather than dropped quietly.',
            },
            {
              title: 'Pick quality or target mode',
              detail:
                'Quality mode encodes every file once at the setting you choose. Target mode searches each file separately for the quality that fits your KB figure.',
            },
            {
              title: 'Choose the output format',
              detail:
                '“Keep each” writes files back in their own formats. Choosing WebP for the whole batch usually reaches a given size at higher visual quality than JPG.',
            },
            {
              title: 'Run the queue',
              detail:
                'One file at a time. Each row updates with its finished size, and target-mode rows that fell short — or that came out no smaller than the original — get a remark under the filename.',
            },
            {
              title: 'Download',
              detail:
                'Take single files from their rows, or the whole set as pixeleditor-compressed.zip, packaged in the page.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="The controls and the readouts">
        <DefinitionList
          items={[
            {
              term: 'Quality mode',
              detail:
                'One setting, default 75, applied to every lossy file. Fast and predictable in appearance; file sizes vary with the content of each image.',
            },
            {
              term: 'Target size',
              detail:
                'A figure in kilobytes, default 200, from 5 to 20000. Each file is searched independently, so a simple graphic and a dense photograph both aim at the same number.',
            },
            {
              term: 'Reduce dimensions if needed',
              detail:
                'On by default in target mode. Files that cannot reach the target at any quality are scaled down in steps until they can, and the row reports the dimensions used.',
            },
            {
              term: 'Output format',
              detail:
                '“Keep each” or one format for the batch. Only formats this browser has proven it can encode are offered.',
            },
            {
              term: 'Total before / after / change',
              detail:
                'Running totals across the finished files, with the percentage change. These are measured byte counts, not estimates.',
            },
            {
              term: 'Per-file remarks',
              detail:
                'Shown under a filename when the target was missed, when dimensions were reduced, or when the output was no smaller than the original.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What compression cannot promise">
        <LimitList
          items={[
            'A target in KB is aimed at, not guaranteed. Detailed photographs have a floor below which they will not encode, and the row says what that floor was.',
            'Fifty files per batch, because each decoded image needs width × height × 4 bytes of memory in the tab.',
            'Target mode is slow by design — several encodes per file, more when dimensions are reduced as well.',
            'Already-compressed files can grow. Those rows are flagged and counted; keep the originals for them.',
            'Compression is lossy and permanent in the output file. Keep your originals until you have checked the results.',
            'Metadata is dropped from every output — no EXIF, GPS or colour profile survives the re-encode.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="Thirty product photos under 300 KB each">
        <p>
          Thirty 3000 × 2000 JPGs at roughly 2 MB each total about 60 MB. In target mode at 300 KB
          with dimension reduction allowed, most will reach the target on quality alone; a few dense
          ones — busy textures, lots of fine detail — will be scaled down a step or two, and their
          rows will say so. The total typically lands near 9 MB, and the change readout gives the
          exact percentage.
        </p>
        <p>
          If the photos also need consistent dimensions, run them through the{' '}
          <Link href="/batch-image-resizer/" className="text-signal underline underline-offset-2">
            batch resizer
          </Link>{' '}
          first and compress the results. For one image where you want to watch the quality slider
          against a live preview, use the{' '}
          <Link href="/image-compressor/" className="text-signal underline underline-offset-2">
            single compressor
          </Link>
          .
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why compress a batch here">
        <BenefitList
          items={[
            {
              title: 'Honest about misses',
              detail:
                'Files that could not reach the target are named, with the size they did reach. Nothing is quietly rounded up into a success.',
            },
            {
              title: 'Per-file target search',
              detail:
                'Every image is searched on its own terms rather than sharing one quality number, which is what makes a hard limit achievable.',
            },
            {
              title: 'Real totals',
              detail:
                'Before, after and percentage change are measured from the encoded files as the queue runs.',
            },
            {
              title: 'No upload, no wait',
              detail:
                'Sixty megabytes of photos would be a long round trip. Here the only cost is your own processor time.',
            },
            {
              title: 'Failures stay contained',
              detail:
                'One unreadable file marks its row and the other forty-nine continue.',
            },
            {
              title: 'One ZIP, built in the page',
              detail:
                'Assembled from the finished files in the browser, with no server involved at any stage.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="Where the batch runs">
        <p>
          In this tab. Each file is decoded, encoded and — if you ask for it — packaged into a ZIP on
          your device. No upload request is made, nothing is written to local storage, a cache or a
          cookie, and the queue disappears when you reload or close the page.
        </p>
        <p>
          The page sets no cookies and loads no analytics. The host that served it can log the page
          request, as every web host can. The{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          describes exactly that and claims nothing further.
        </p>
      </Section>
    </ToolPage>
  );
}
