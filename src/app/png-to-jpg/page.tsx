import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { ConvertTool } from '@/components/tools/ConvertTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'png-to-jpg';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Convert PNG to JPG with a quality slider',
  'Choose the background colour for transparent areas',
  'Warns when the source has transparency',
  'Before and after size comparison',
  'Runs in the browser with no upload',
];

const FAQ: FaqItem[] = [
  {
    q: 'What happens to transparency when I convert PNG to JPG?',
    a: 'It is flattened. JPG has no alpha channel, so every transparent or semi-transparent pixel is blended onto the background colour you choose — white by default. The tool detects an alpha channel in the source and warns you before you download, so a logo with a see-through background does not surprise you with a white box.',
  },
  {
    q: 'What quality should I use for PNG to JPG?',
    a: 'For photographs and screenshots of photographs, 80 to 88 keeps them visually identical at a fraction of the size. For screenshots of text and user interfaces, JPG is the wrong format at any quality — crisp edges develop halos — and WebP or a smaller PNG will serve you better.',
  },
  {
    q: 'Why is the JPG larger than my PNG?',
    a: 'It happens with flat graphics. A PNG of a logo with three colours compresses to a few KB because PNG loves flat areas; JPG spends bytes fighting the sharp edges. The tool flags this when it occurs. For that kind of image, keep the PNG or try WebP.',
  },
  {
    q: 'Can I choose a transparent background for the JPG?',
    a: 'No — the format cannot store one. If the destination needs transparency, convert to WebP instead, which keeps the alpha channel and is still far smaller than PNG.',
  },
  {
    q: 'Does converting to JPG remove the PNG metadata?',
    a: 'Yes. The output is a freshly encoded JPEG with no text chunks, no colour profile and no EXIF. If you need to know what the PNG carried, inspect it with the EXIF remover first.',
  },
  {
    q: 'Is the PNG uploaded anywhere during the conversion?',
    a: 'No. The PNG is decoded, flattened onto the background colour and encoded as JPEG entirely inside this tab. No request carries the image, and you can verify that in the browser’s network panel.',
  },
];

export default function PngToJpgPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={
        <ConvertTool
          to="image/jpeg"
          sourceLabel="PNG"
          expectedSource={['image/png']}
          defaultQuality={85}
        />
      }
      features={FEATURES}
      faq={FAQ}
      relatedIntro="If a smaller file is the real goal, or you need to keep transparency, these are the pages to try next."
    >
      <Section id="overview" eyebrow="Overview" title="Trading exactness for size">
        <p>
          A PNG stores every pixel faithfully, which is exactly what you want for a logo and
          exactly what you do not want for a 6 MB screenshot of a photograph. Converting to JPG
          swaps that faithfulness for a file a fifth of the size or smaller. The two things that
          go wrong in the swap are transparency, which JPG cannot hold, and quality, which JPG
          discards — so this page puts both decisions in front of you rather than making them
          silently.
        </p>
        <p>
          The conversion runs in your browser. You see the source size, the output size at the
          quality you pick, and a warning if the PNG had transparent areas that are about to
          become a solid colour.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="From PNG to JPG in the browser">
        <Steps
          items={[
            {
              title: 'Drop the PNG',
              detail:
                'The tool checks the file bytes to confirm the format and reads the PNG header to see whether the image carries an alpha channel.',
            },
            {
              title: 'Set the quality',
              detail:
                'The slider defaults to 85. The output size updates as you move it, so you can watch the trade-off rather than guess it.',
            },
            {
              title: 'Choose a background',
              detail:
                'If the PNG has transparent pixels, they are blended onto this colour. White suits most documents; match your page colour for web graphics.',
            },
            {
              title: 'The JPG is encoded',
              detail:
                'The flattened pixels are written as JPEG at the chosen quality. The readout shows the finished byte count and the percentage change.',
            },
            {
              title: 'Download',
              detail: 'The file keeps its name with the extension changed to .jpg.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="The three things you control">
        <DefinitionList
          items={[
            {
              term: 'Quality',
              detail:
                '1 to 100. Higher keeps more detail and more bytes. 85 is the default because PNG sources are often screenshots, and screenshots show compression sooner than photographs do.',
            },
            {
              term: 'Fill colour',
              detail:
                'The colour that replaces transparency. Only relevant when the source has transparent pixels; harmless otherwise.',
            },
            {
              term: 'Output',
              detail:
                'Fixed to JPG. Use the switcher for a different target — PNG to WebP keeps transparency and is usually smaller still.',
            },
            {
              term: 'Unexpected input',
              detail:
                'Dropping a JPG, WebP or other format here still works; the tool notes the mismatch and converts anyway. A JPG source is renamed with a “-converted” suffix so the original is not replaced.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What JPG cannot do">
        <LimitList
          items={[
            'No transparency. Every see-through pixel becomes the fill colour, permanently. There is no setting that avoids this — it is the format.',
            'Sharp edges soften. Text, line art and user-interface screenshots develop faint halos at any quality below the maximum. Those images belong in PNG or WebP.',
            'Flat graphics can grow. A three-colour logo is smaller as PNG than as JPG; the tool warns when the output is larger than the input.',
            'Detail is discarded. Once written as JPG, the exact PNG pixels are gone from that file. Keep the PNG if you may need them.',
            'No metadata is carried across. PNG text chunks and colour profiles are dropped.',
            'Images beyond roughly 100 megapixels are refused because the canvas cannot usually be allocated.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="A 5.6 MB screenshot to a 480 KB email attachment">
        <p>
          A full-screen screenshot of a photo-heavy web page saved as PNG easily reaches 5 MB —
          far too much for an email thread. Dropped here at quality 85, the same image typically
          comes out between 350 KB and 600 KB with no visible change to the photographs in it.
          The small text in the browser chrome softens very slightly, which is the trade-off
          being made.
        </p>
        <p>
          If that softening matters — a screenshot of code, say — the better route is the{' '}
          <Link href="/png-to-webp/" className="text-signal underline underline-offset-2">
            PNG to WebP converter
          </Link>{' '}
          in lossless mode, which keeps every pixel and still lands well under the PNG size for
          most screenshots.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why convert here">
        <BenefitList
          items={[
            {
              title: 'Transparency is not a surprise',
              detail:
                'The tool reads the PNG header for an alpha channel and warns before you download, instead of leaving you to discover a white rectangle later.',
            },
            {
              title: 'Live size feedback',
              detail:
                'Move the quality slider and the output byte count follows. The number is the real encoded size, not a projection.',
            },
            {
              title: 'Background you choose',
              detail:
                'White is not always right. Pick the colour that matches the page or document the JPG is going into.',
            },
            {
              title: 'Nothing leaves the tab',
              detail:
                'A screenshot of a private dashboard is exactly the kind of file that should not be uploaded to convert. Here it is not.',
            },
            {
              title: 'Warns when JPG is the wrong choice',
              detail:
                'If the output grows, the tool says so. Flat graphics are better left as PNG or written as WebP.',
            },
            {
              title: 'No signup, no watermark',
              detail: 'The conversion is the whole product. Nothing is stamped on the result.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="Where the conversion runs">
        <p>
          In this tab, on your device. The PNG is decoded, flattened and encoded as JPEG in
          memory; no upload request is made to do it. Nothing is written to local storage, a cache
          or a cookie, and closing the page releases everything.
        </p>
        <p>
          No cookies are set and no analytics run. The server that delivered this page can log the
          request for the page — as any host can — and the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          describes exactly that.
        </p>
      </Section>
    </ToolPage>
  );
}
