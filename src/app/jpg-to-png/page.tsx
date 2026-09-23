import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { ConvertTool } from '@/components/tools/ConvertTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'jpg-to-png';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Convert JPG and JPEG to PNG',
  'Lossless output — no quality setting to get wrong',
  'Detects the real format from the file bytes',
  'Before and after size comparison',
  'Runs in the browser with no upload',
];

const FAQ: FaqItem[] = [
  {
    q: 'Why is the PNG so much bigger than the JPG?',
    a: 'Because PNG stores every pixel exactly and JPG does not. A JPG has already thrown detail away to get small; turning it into PNG keeps all the remaining pixels losslessly, and photographs compress poorly that way. A 300 KB JPG becoming a 3 MB PNG is normal. The PNG is not higher quality — it is a faithful copy of the JPG’s pixels, JPEG artefacts included.',
  },
  {
    q: 'Does converting JPG to PNG improve the quality?',
    a: 'No. Detail the JPG discarded is gone; no format change can bring it back. What the conversion does give you is a file that will not degrade further when edited and saved repeatedly, which is the main practical reason to make the switch before a long editing session.',
  },
  {
    q: 'Will the PNG have a transparent background?',
    a: 'Not automatically. A JPG has no transparency to begin with, so the PNG is fully opaque. Making a background transparent requires selecting and removing it in an editor — this tool changes the container, not the picture.',
  },
  {
    q: 'Is there a quality slider?',
    a: 'No, deliberately. PNG is lossless, so there is no quality to trade for size. If you need a smaller file, the compressor with WebP or JPG output is the right tool; if you need exact pixels, PNG already gives you that.',
  },
  {
    q: 'Is JPEG the same as JPG?',
    a: 'Yes. JPG is simply the three-letter form of JPEG from the days when file extensions were limited to three characters. Both extensions describe the same format and both are accepted here.',
  },
  {
    q: 'Is my photo uploaded to convert it?',
    a: 'No. The JPG is decoded in this tab and the pixels are re-encoded as PNG on your device. There is no server in the process and no request carrying your image.',
  },
];

export default function JpgToPngPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={
        <ConvertTool
          to="image/png"
          sourceLabel="JPG"
          expectedSource={['image/jpeg']}
        />
      }
      features={FEATURES}
      faq={FAQ}
      relatedIntro="Going the other way, or on to WebP, is a page away. These are the neighbouring conversions."
    >
      <Section id="overview" eyebrow="Overview" title="When a JPG needs to be a PNG">
        <p>
          The reasons are usually practical rather than aesthetic. A form insists on PNG. A design
          tool imports PNG cleanly but mangles JPEG colour profiles. You are about to edit a photo
          in many rounds and do not want each save to compress it again. Or a script expects one
          extension and you have the other. None of those need a server, and none of them need a
          quality decision, because PNG has no quality to decide.
        </p>
        <p>
          This page does exactly one thing: it decodes a JPG in your browser and writes the same
          pixels out as a PNG. Larger file, identical picture, no upload.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="The conversion, step by step">
        <Steps
          items={[
            {
              title: 'Drop the JPG',
              detail:
                'The tool reads the first bytes to confirm it really is a JPEG, regardless of what the extension claims, and shows the original size.',
            },
            {
              title: 'The image is decoded',
              detail:
                'The JPEG is turned into raw pixels in memory. Any EXIF orientation is applied so the PNG comes out upright.',
            },
            {
              title: 'The pixels are written as PNG',
              detail:
                'PNG compression is lossless, so the encoder stores every pixel exactly as decoded. This is why there is no slider.',
            },
            {
              title: 'Sizes are compared',
              detail:
                'The readout shows the original and the PNG side by side. Expect the PNG to be larger — it is the expected outcome, not a fault.',
            },
            {
              title: 'Download',
              detail: 'The file keeps its name with the extension changed to .png.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="What you can and cannot adjust">
        <DefinitionList
          items={[
            {
              term: 'Output',
              detail:
                'Fixed to PNG. The page is the choice; if you want a different target, the other conversion pages are one click away in the switcher.',
            },
            {
              term: 'Quality',
              detail:
                'None. PNG is lossless, so every pixel from the decoded JPG is stored exactly. There is nothing to trade off.',
            },
            {
              term: 'Transparency',
              detail:
                'Not applicable on input — a JPG cannot carry it — so the PNG is written fully opaque.',
            },
            {
              term: 'Unexpected input',
              detail:
                'If you drop something that is not a JPG, the tool tells you and converts it anyway. A PNG dropped here comes out as a PNG with a “-converted” suffix so nothing is overwritten.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What to expect from the output">
        <LimitList
          items={[
            'The PNG will be larger than the JPG, often by a factor of five to ten for photographs. This is inherent to lossless storage, not a setting.',
            'JPEG compression artefacts are preserved exactly. The PNG is a faithful copy of the decoded JPG, blocks and all.',
            'No EXIF, GPS or colour profile is carried across. The PNG contains pixels and nothing else.',
            'CMYK JPEGs are decoded to RGB by the browser, which can shift colours slightly. Most JPGs are RGB and unaffected.',
            'Images beyond roughly 100 megapixels are refused because the canvas allocation normally fails.',
            'Progressive and baseline JPEGs are both fine; the browser handles either.',
          ]}
        />
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why use this page for the job">
        <BenefitList
          items={[
            {
              title: 'Nothing to get wrong',
              detail:
                'There is no quality setting to misjudge. The only decision is which file to drop.',
            },
            {
              title: 'Honest about size',
              detail:
                'The readout shows the PNG growing and says why. A tool that hid that would be hiding the one thing worth knowing.',
            },
            {
              title: 'Format sniffed, not assumed',
              detail:
                'A file called photo.jpg that is really a PNG is identified from its bytes, so you are told what you actually have.',
            },
            {
              title: 'No upload',
              detail:
                'A JPG-to-PNG conversion is trivial work; uploading the file would take longer than doing it.',
            },
            {
              title: 'No account or watermark',
              detail: 'The download is the download. Nothing is stamped on it and nothing is gated.',
            },
            {
              title: 'The batch page is next door',
              detail:
                'A folder of JPGs goes through the batch converter with the same engine and comes back as a ZIP.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="What happens to the JPG">
        <p>
          It is decoded in this tab and re-encoded as PNG on your device. No upload request is made
          to convert it, nothing is stored in local storage or a cache, and the decoded pixels are
          released when you load another file or close the page.
        </p>
        <p>
          The page sets no cookies and loads no analytics. The host that served it can log the
          request for the page itself, as every host can; the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          describes that plainly.
        </p>
      </Section>
    </ToolPage>
  );
}
