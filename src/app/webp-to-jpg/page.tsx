import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { ConvertTool } from '@/components/tools/ConvertTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'webp-to-jpg';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Convert WebP to JPG',
  'Quality slider with live output size',
  'Background colour for transparent WebP areas',
  'Warns when the WebP carries transparency',
  'Runs in the browser with no upload',
];

const FAQ: FaqItem[] = [
  {
    q: 'Why do I keep getting WebP files I cannot open?',
    a: 'Because most websites now serve WebP to browsers that accept it, and “Save image as” gives you whatever the site sent. Your browser can display it, but older desktop software, some email clients and many upload forms cannot. Converting to JPG produces the file those programs expect.',
  },
  {
    q: 'Will converting WebP to JPG lose quality?',
    a: 'A little, because JPG is lossy and the WebP was probably lossy too, so you are compressing twice. At the default quality of 88 the loss is not visible at normal sizes. There is no way to make the JPG better than the WebP; the aim is to make it no worse than it needs to be.',
  },
  {
    q: 'What happens to a transparent WebP?',
    a: 'The transparent areas are filled with the background colour you choose, because JPG cannot store transparency. The tool reads the WebP header and warns you when this is about to happen. If you need the transparency kept, PNG is the format for it — the batch converter can write PNG.',
  },
  {
    q: 'Can I convert an animated WebP?',
    a: 'Only the first frame. JPG has no animation, and this is a still-image tool. The output is a single JPG of whatever the first frame shows.',
  },
  {
    q: 'Which is better, WebP or JPG?',
    a: 'For the web, WebP: smaller at the same quality, with transparency. For everything else, JPG wins on compatibility — it has been readable by every program for thirty years. This page exists because compatibility is the problem you have right now.',
  },
  {
    q: 'Is the WebP uploaded to convert it?',
    a: 'No. The WebP is decoded and the JPG encoded inside this tab. No request carrying the image is sent.',
  },
];

export default function WebpToJpgPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={
        <ConvertTool
          to="image/jpeg"
          sourceLabel="WebP"
          expectedSource={['image/webp']}
        />
      }
      features={FEATURES}
      faq={FAQ}
      relatedIntro="The reverse conversion, and the pages that keep transparency when JPG cannot."
    >
      <Section id="overview" eyebrow="Overview" title="For the software that still says no">
        <p>
          WebP is excellent on the web and a nuisance off it. You save a picture from a site,
          try to attach it, insert it, print it or upload it somewhere else, and the program
          refuses because it has never heard of the format. The fix is a JPG — the one image
          format nothing rejects — and this page makes one from a WebP without sending the file
          anywhere.
        </p>
        <p>
          The conversion runs in your browser, which has decoded WebP natively for years. You set
          the quality, pick a background colour in case the WebP was transparent, and download
          a file that will open in whatever refused the original.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="The conversion">
        <Steps
          items={[
            {
              title: 'Drop the WebP',
              detail:
                'The tool confirms the format from the file bytes — a .webp that is really a JPG is identified as such — and checks the header for an alpha channel.',
            },
            {
              title: 'The image is decoded',
              detail:
                'The browser turns the WebP into raw pixels. Both lossy and lossless WebP decode the same way; animated WebP yields its first frame.',
            },
            {
              title: 'Transparency is flattened',
              detail:
                'If the WebP had transparent areas, they are blended onto the background colour. The tool warns you first.',
            },
            {
              title: 'The JPG is encoded',
              detail:
                'The pixels are written as JPEG at the quality you set. The readout shows the finished byte count.',
            },
            {
              title: 'Download',
              detail: 'The file keeps its name with the extension changed to .jpg.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="What you control">
        <DefinitionList
          items={[
            {
              term: 'Quality',
              detail:
                '1 to 100, default 88. The WebP has already been compressed once, so a high setting here keeps the second compression from being visible.',
            },
            {
              term: 'Fill colour',
              detail:
                'Replaces transparent pixels. White by default; match the page or document the JPG will sit on. Ignored when the WebP has no alpha channel.',
            },
            {
              term: 'Output',
              detail:
                'Fixed to JPG. The switcher above the article leads to JPG-to-WebP if you need to go back the other way.',
            },
            {
              term: 'Unexpected input',
              detail:
                'A PNG or JPG dropped here still converts. A JPG source is renamed with a “-converted” suffix so the original is not overwritten.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What JPG takes away">
        <LimitList
          items={[
            'Transparency is gone. Every see-through pixel becomes the fill colour. For a transparent result, the batch converter can write PNG instead.',
            'Animation is gone. An animated WebP gives one JPG of its first frame.',
            'Quality is compressed twice. A lossy WebP turned into a JPG carries both sets of artefacts; keep the WebP as your master copy.',
            'Sharp edges soften. Screenshots of text or interfaces look better as PNG than as JPG.',
            'Metadata is dropped. Any EXIF or colour profile in the WebP is not carried into the JPG.',
            'Images over roughly 100 megapixels are refused because the canvas cannot usually be allocated.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="A product photo saved from a shop, into a print order form">
        <p>
          A 1600 × 1600 WebP saved from a product page is typically 120 KB to 200 KB. The print
          shop’s order form accepts JPG and PNG only. Dropped here at quality 88, the JPG comes out
          around 250 KB to 400 KB — larger than the WebP, which is expected, since JPG is the
          less efficient format — and uploads without complaint.
        </p>
        <p>
          If the form also had a size cap, the{' '}
          <Link href="/image-compressor/" className="text-signal underline underline-offset-2">
            compressor
          </Link>{' '}
          with JPG output and a KB target would be the next stop. And for a folder of saved WebP
          files, the{' '}
          <Link href="/batch-image-converter/" className="text-signal underline underline-offset-2">
            batch converter
          </Link>{' '}
          writes them all as JPG and returns a ZIP.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why convert here">
        <BenefitList
          items={[
            {
              title: 'It just needs to open',
              detail:
                'The job is compatibility, and JPG is the format with the most of it. One drop, one download, done.',
            },
            {
              title: 'Transparency warning',
              detail:
                'The WebP header is read for an alpha channel and the tool says so before you download, rather than after a white box appears.',
            },
            {
              title: 'Real sizes',
              detail:
                'The output byte count is measured from the encoded file and updates as you move the quality slider.',
            },
            {
              title: 'Nothing uploaded',
              detail:
                'Images you saved from the web are often not yours to redistribute. Converting them on your own device keeps it that way.',
            },
            {
              title: 'Works on a phone',
              detail:
                'A WebP saved in a mobile browser can be converted right there and attached to whatever needed the JPG.',
            },
            {
              title: 'No account, no watermark',
              detail: 'Nothing gates the download and nothing is stamped on it.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="What happens to the WebP">
        <p>
          It is decoded in this tab and re-encoded as JPG on your device. No upload request is
          made in order to convert it, nothing is written to local storage or a cache, and the
          decoded pixels are released when you load another file or close the page.
        </p>
        <p>
          The page sets no cookies and loads no analytics. The host that served it can log the
          page request, as every host can — the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          describes exactly that and nothing more.
        </p>
      </Section>
    </ToolPage>
  );
}
