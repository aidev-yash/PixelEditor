import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { DimensionsTool } from '@/components/tools/DimensionsTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'image-dimensions-checker';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Read width, height, megapixels and aspect ratio',
  'Check several images side by side in one table',
  'Print size at 72, 150 or 300 DPI',
  'Detects the real format from the file bytes',
  'Copy every measurement as a table',
];

const FAQ: FaqItem[] = [
  {
    q: 'How do I check an image’s dimensions without opening an editor?',
    a: 'Drop it here. The width, height, aspect ratio and file size appear immediately, along with megapixels, orientation, format and print size. Nothing is installed and nothing is uploaded — the file is read in the page.',
  },
  {
    q: 'Can I check several images at once?',
    a: 'Yes. Drop a whole selection and each one becomes a row in the table with its dimensions, ratio and size. Click a row to see its full details, and use “Copy all details” to put the entire table on your clipboard as tab-separated text that pastes straight into a spreadsheet.',
  },
  {
    q: 'What does the print size figure mean?',
    a: 'A pixel has no physical size until you decide how densely to print it. At 300 DPI a 3000-pixel-wide image prints 10 inches wide; at 72 DPI the same image covers 41.7 inches. The tool shows inches and centimetres for the density you pick, which is how you tell whether a photo is big enough for the print you have in mind.',
  },
  {
    q: 'Why does it say my file is not the format its name claims?',
    a: 'Because the tool identifies formats from the first bytes of the file rather than the extension. A PNG renamed to .jpg is common — screenshots, downloads and chat apps all cause it — and it is the usual reason an upload form rejects a file that looks fine. The notice tells you what the file actually is.',
  },
  {
    q: 'Does it show EXIF data, camera settings or GPS?',
    a: 'No. This page measures the picture: size, ratio, format, transparency. To see the metadata a photo carries — camera, date, GPS coordinates — use the metadata remover, which lists what is there before it strips it.',
  },
  {
    q: 'Are the images uploaded to be measured?',
    a: 'No. They are decoded in this tab to read their size. Nothing is re-saved, nothing is written to storage, and no request carries the files.',
  },
];

export default function ImageDimensionsCheckerPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={<DimensionsTool />}
      features={FEATURES}
      faq={FAQ}
      relatedIntro="Once you know the numbers, these are the pages that change them."
    >
      <Section id="overview" eyebrow="Overview" title="The numbers, before you decide anything">
        <p>
          Most image problems start with a measurement you did not have. The upload form says
          “maximum 2000 px” and you do not know how wide the photo is. The print shop wants 300 DPI
          and you cannot tell whether your file is big enough. A banner looks wrong and the cause is
          a 4:3 image in a 16:9 slot. This page answers those questions in the time it takes to drop
          a file, without an editor, an install or an upload.
        </p>
        <p>
          It reads only. Nothing is re-encoded and nothing is downloaded — the images you drop here
          are exactly as they were when you close the tab.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="What the checker reads">
        <Steps
          items={[
            {
              title: 'Drop one image or many',
              detail:
                'Every file you drop is added to the table. Drop a second batch later and the rows are appended rather than replacing what is there.',
            },
            {
              title: 'The file is decoded in the page',
              detail:
                'The browser decodes each image to learn its true pixel dimensions, and the first bytes are read to identify the real format.',
            },
            {
              title: 'The headline figures appear',
              detail:
                'Width, height, aspect ratio and file size sit across the top of the workspace for whichever image is selected.',
            },
            {
              title: 'The detail list fills in',
              detail:
                'Megapixels, the named ratio where there is one, orientation, format, whether the file has an alpha channel, and the print size at your chosen density.',
            },
            {
              title: 'Copy or compare',
              detail:
                '“Copy all details” puts every row on the clipboard as tab-separated text, ready to paste into a spreadsheet.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Readings" title="What each figure means">
        <DefinitionList
          items={[
            {
              term: 'Dimensions',
              detail:
                'Width × height in pixels, taken from the decoded image. Photos with an EXIF rotation tag are reported the way they actually display.',
            },
            {
              term: 'Aspect ratio',
              detail:
                'The width-to-height relationship reduced to its simplest form, with the familiar name beside it when the image matches one — 16:9, 4:3, 3:2, 1:1 and so on.',
            },
            {
              term: 'Megapixels',
              detail:
                'Width × height ÷ one million. This is the figure cameras advertise and the one print labs ask about.',
            },
            {
              term: 'Orientation',
              detail: 'Landscape, portrait or square, derived from the two dimensions.',
            },
            {
              term: 'Format',
              detail:
                'Identified from the file contents, not the extension. A mismatch between the two raises a notice.',
            },
            {
              term: 'Transparency',
              detail:
                'Read from the file header: whether the image declares an alpha channel. For formats where the header does not say, the row reports that it was not determined.',
            },
            {
              term: 'Print size at 72 / 150 / 300 DPI',
              detail:
                'The physical size the pixels would cover at that print density, in inches and centimetres. 300 is standard for photo printing, 150 for large posters viewed at a distance, 72 for screen mock-ups.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What it does not tell you">
        <LimitList
          items={[
            'No EXIF, camera settings or GPS. That is the metadata remover’s job, and it lists what it finds before removing it.',
            'No colour profile or bit-depth reporting. The browser normalises images to RGB as it decodes them, so those details are not reliably visible from here.',
            'Transparency is read from the header, which tells you an alpha channel exists — not whether any pixel actually uses it.',
            'Animated GIF and WebP report the dimensions of the image, not the frame count or duration.',
            'Extremely large images — well beyond 100 megapixels — may fail to decode at all. When that happens the file is reported as an error instead of a row.',
            'The list lives in the page only. Reloading clears it; nothing is remembered between visits.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="Is this photo big enough for an A4 print?">
        <p>
          A4 is 8.27 × 11.69 inches. At 300 DPI that needs roughly 2480 × 3508 pixels. Drop the
          photo, set the density to 300 DPI, and read the print width and height rows: if they reach
          or exceed those inch figures, the file is large enough. A 12-megapixel phone photo at
          4032 × 3024 prints 13.44 × 10.08 inches at 300 DPI — comfortably more than A4 in
          landscape.
        </p>
        <p>
          If it falls short, printing at 150 DPI doubles the physical size at some cost in
          sharpness. If it is far larger than needed, the{' '}
          <Link href="/image-resizer/" className="text-signal underline underline-offset-2">
            resizer
          </Link>{' '}
          will bring it down to exact pixels, and the{' '}
          <Link href="/image-compressor/" className="text-signal underline underline-offset-2">
            compressor
          </Link>{' '}
          will bring the file size down to a specific number of kilobytes.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why check here">
        <BenefitList
          items={[
            {
              title: 'Faster than an editor',
              detail:
                'No application to launch and no import dialogue. Drop the file and the numbers are on screen.',
            },
            {
              title: 'Many images at once',
              detail:
                'A table of every file you dropped makes odd sizes in a batch obvious at a glance.',
            },
            {
              title: 'Print maths done for you',
              detail:
                'Inches and centimetres at three common densities, rather than you dividing pixels by DPI on a calculator.',
            },
            {
              title: 'Catches the wrong-format trap',
              detail:
                'A PNG named .jpg is flagged, which explains a surprising number of rejected uploads.',
            },
            {
              title: 'Copy straight to a spreadsheet',
              detail:
                'Tab-separated output pastes into columns without any cleaning up.',
            },
            {
              title: 'Read-only and local',
              detail:
                'Nothing is modified, nothing is written, and the files never leave the device.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="Reading is all that happens">
        <p>
          Each image is decoded in this tab to measure it. No upload request is made, nothing is
          written to local storage, a cache or a cookie, and no output file is produced at all. The
          list of measured images exists in the page’s memory and is gone when you reload or close
          it.
        </p>
        <p>
          The page sets no cookies and loads no analytics. The host that served it can log the page
          request — IP address, timestamp, user agent — as every web host can; the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          says so plainly and claims nothing beyond it.
        </p>
      </Section>
    </ToolPage>
  );
}
