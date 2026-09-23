import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { RotateFlipTool } from '@/components/tools/RotateFlipTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'rotate-flip-image';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Rotate 90, 180 or 270 degrees',
  'Flip horizontally or vertically',
  'Rotation written into the pixels, not an orientation tag',
  'Before and after preview',
  'Runs in the browser with no upload',
];

const FAQ: FaqItem[] = [
  {
    q: 'Why does my photo look sideways in some apps but not others?',
    a: 'Because the pixels are stored sideways and a small EXIF orientation tag tells viewers to turn them. Phones do this constantly. Apps that honour the tag show the photo upright; older software, some upload forms and many web canvases ignore it. This tool writes the upright version into the pixels themselves, so every viewer agrees.',
  },
  {
    q: 'Does rotating a JPG lose quality?',
    a: 'A little, because the rotated image has to be re-encoded and JPEG is lossy. The default quality of 90 keeps that loss small enough to be invisible in normal use. If you need a genuinely lossless result, write PNG — the file will be larger but every pixel will be exact.',
  },
  {
    q: 'Can I rotate by a custom angle, like 3 degrees to level a horizon?',
    a: 'Not here. This tool handles quarter turns and mirroring, which cover the vast majority of “it came out sideways” problems. Arbitrary angles need a canvas larger than the source and a decision about what fills the corners, which is a different tool.',
  },
  {
    q: 'What is the difference between flipping and rotating 180 degrees?',
    a: 'A 180° rotation turns the image upside down and back-to-front together, so text still reads left to right once you turn your head. A flip mirrors one axis only: a horizontal flip swaps left and right, so text reads backwards. Flipping both axes gives the same result as rotating 180°.',
  },
  {
    q: 'Does it keep my EXIF data?',
    a: 'No. The output is a freshly encoded image with no metadata, which is deliberate: carrying an old orientation tag across a rotation would make the photo turn twice in tag-aware viewers. If you want to inspect what the original carried first, the EXIF remover shows every tag.',
  },
  {
    q: 'Is the image uploaded to rotate it?',
    a: 'No. The image is decoded in this tab, drawn onto a canvas with the transform applied, and encoded to a new file here. No request carrying the picture is sent.',
  },
];

export default function RotateFlipPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={<RotateFlipTool />}
      features={FEATURES}
      faq={FAQ}
      relatedIntro="A rotation is often the first fix before a crop or a metadata check. These tools follow on naturally."
    >
      <Section id="overview" eyebrow="Overview" title="Fixing a sideways photo for good">
        <p>
          A phone held upright still records its sensor sideways, and it fixes the picture by
          attaching a note — the EXIF orientation tag — that asks viewers to turn it. Most photo
          apps obey the note. Plenty of other software does not: web forms, older Windows
          previews, some printers, and the HTML canvas in many browsers. The result is a photo
          that looks fine on your phone and lands sideways everywhere else.
        </p>
        <p>
          This tool rotates the actual pixels. It reads the orientation tag, applies it so you see
          the picture the way your phone intended, lets you turn or mirror it further, and writes
          a plain upright file with no tag to misread. It does all of that in your browser.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="What a quarter turn involves">
        <Steps
          items={[
            {
              title: 'Load the photo',
              detail:
                'Any EXIF orientation is applied on decode, so the preview shows the picture as your camera meant it — not as the raw sensor stored it.',
            },
            {
              title: 'Turn or mirror',
              detail:
                'Left and right turn the image 90° each press; 180° flips it over. The horizontal and vertical flips mirror one axis and can be combined with a rotation.',
            },
            {
              title: 'The pixels are redrawn',
              detail:
                'A new canvas is created at the rotated dimensions — a 4000 × 3000 image becomes 3000 × 4000 after a quarter turn — and the source is drawn onto it with the transform applied.',
            },
            {
              title: 'The file is encoded fresh',
              detail:
                'The result is written as a new image in the format you chose, with no orientation tag, so it appears the same way in every viewer.',
            },
            {
              title: 'Download',
              detail:
                'The readout shows the new dimensions and the encoded size. The download is named with a suffix so it does not overwrite the original.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="The controls">
        <DefinitionList
          items={[
            {
              term: 'Rotate left / right',
              detail:
                'Each press adds a quarter turn in that direction. Four presses bring the image back to upright.',
            },
            {
              term: 'Rotate 180°',
              detail: 'Turns the image upside down in one step. Equivalent to two quarter turns.',
            },
            {
              term: 'Flip horizontal',
              detail:
                'Mirrors left and right, as if viewed in a mirror. Useful for selfies that a front camera stored reversed.',
            },
            {
              term: 'Flip vertical',
              detail: 'Mirrors top and bottom. Less common, but it is the fix for some scanner output.',
            },
            {
              term: 'Output format',
              detail:
                'Keep the source format, or write JPG, PNG or WebP. PNG is the choice when you cannot afford any re-encoding loss at all.',
            },
            {
              term: 'Quality',
              detail:
                'Shown for lossy formats and set to 90 by default, because a rotation is not the place to lose detail.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What it handles and what it does not">
        <p>
          Reads JPG, PNG, WebP, GIF, BMP and, in most browsers, AVIF. Writes JPG and PNG everywhere,
          WebP in current browsers, and AVIF where the browser proves it can encode it.
        </p>
        <LimitList
          items={[
            'Only quarter turns. Levelling a horizon by a few degrees is not something this tool does.',
            'A rotated JPG is re-encoded, which costs a small amount of detail. This is inherent to JPEG, not to the tool; writing PNG avoids it.',
            'The output carries no metadata. EXIF, GPS and colour profile tags from the original are not copied into the rotated file.',
            'Transparent images written as JPG lose their transparency, because JPEG cannot store it.',
            'Animated files are rotated on their first frame only.',
            'Images beyond roughly 100 megapixels are refused because the browser cannot usually allocate the canvas.',
          ]}
        />
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why rotate here instead of relying on the tag">
        <BenefitList
          items={[
            {
              title: 'The fix is permanent',
              detail:
                'Because the pixels themselves are turned, the photo is upright in every program, including the ones that ignore orientation tags.',
            },
            {
              title: 'What you see is what you get',
              detail:
                'The before and after previews are rendered from the actual decoded image, so a mismatch between your phone and the tool cannot hide.',
            },
            {
              title: 'Quick to operate',
              detail:
                'Three buttons and two toggles. The preview updates immediately after each press.',
            },
            {
              title: 'No upload',
              detail:
                'A rotation is a trivial amount of work; sending the file to a server for it would take longer than the rotation.',
            },
            {
              title: 'Combines with the cropper',
              detail:
                'Turn it here, then crop it. Both tools run on the same device, so the round-trip is a download and a drop.',
            },
            {
              title: 'Nothing left behind',
              detail:
                'No account, no history, no stored copy. The tab is the whole session.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="What happens to the picture">
        <p>
          It is decoded into this tab, transformed on a canvas and encoded back into a file, all
          on your device. No upload request is made in order to rotate it. Nothing is stored in
          local storage, a cache or a cookie, and the decoded image is released when you load
          another or close the page.
        </p>
        <p>
          This page sets no cookies and runs no analytics. The host that served it can log the
          request for the page — an IP address, a timestamp, a user-agent — which the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          spells out.
        </p>
      </Section>
    </ToolPage>
  );
}
