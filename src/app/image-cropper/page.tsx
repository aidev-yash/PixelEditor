import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { CropperTool } from '@/components/tools/CropperTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'image-cropper';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'Drag the crop frame or type exact pixel values',
  'Square, 4:3, 3:2, 16:9 and 9:16 ratio presets',
  'Keyboard nudging of the crop frame',
  'Pixel-accurate output dimensions',
  'Runs in the browser with no upload',
];

const FAQ: FaqItem[] = [
  {
    q: 'How do I crop an image to a square?',
    a: 'Pick the 1:1 preset. The largest square that fits is centred on the image; drag it to the part you want, or type an X and Y offset if you know the exact position. The width and height stay equal while you resize the frame.',
  },
  {
    q: 'Can I crop to exact pixel dimensions?',
    a: 'Yes. The numeric fields set the frame directly: X and Y for the top-left corner, then width and height. Type 300 × 300 at 120, 80 and that is precisely the region you get, without any rounding from a dragged handle.',
  },
  {
    q: 'Does cropping reduce quality?',
    a: 'The pixels you keep are copied exactly; nothing inside the frame is resampled. What can change is the encoding: if the output is JPG, the kept region is re-encoded, which loses a little detail in the same way saving any JPG does. Writing PNG keeps the region byte-for-byte accurate.',
  },
  {
    q: 'Why is my crop frame snapping when I resize it?',
    a: 'Because a ratio preset is on. With 16:9 selected, dragging a corner changes the width and derives the height so the shape holds. Switch to Free to move each edge independently.',
  },
  {
    q: 'Can I crop a photo for Instagram, a passport or a YouTube thumbnail?',
    a: 'The presets cover the shapes those need — 1:1 and 4:5-style portraits via the free frame, 16:9 for thumbnails and 9:16 for vertical video covers. Exact pixel sizes such as 1280 × 720 are then a matter of typing them into the width and height fields.',
  },
  {
    q: 'Is the photo uploaded to crop it?',
    a: 'No. The image is decoded in this tab, the region you chose is copied onto a new canvas, and that canvas is encoded to a file for download. There is no server involved in any of those steps.',
  },
];

export default function ImageCropperPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={<CropperTool />}
      features={FEATURES}
      faq={FAQ}
      relatedIntro="Cropping often comes just before a resize or a straightening. These are the tools for those steps."
    >
      <Section id="overview" eyebrow="Overview" title="A crop tool with two equally exact inputs">
        <p>
          Cropping is the one image edit almost everyone needs and almost every tool gets slightly
          wrong: the dragged frame lands a few pixels off, the exported size is not what the
          numbers said, or the whole thing happens on a server that has now seen your photo. This
          cropper keeps a single source of truth — the crop rectangle in image pixels — and lets
          you set it either by dragging or by typing. Both paths write the same four numbers, so
          the result is the same either way.
        </p>
        <p>
          The work happens in your browser. The region you keep is copied out of the decoded
          image onto a fresh canvas and encoded into the format you choose, and the download is
          the only thing that leaves the tab.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="From frame to file">
        <Steps
          items={[
            {
              title: 'Load the image',
              detail:
                'Drop a file or browse for one. The full picture is shown with the crop frame covering all of it, so the starting point is “keep everything”.',
            },
            {
              title: 'Choose a shape, or stay free',
              detail:
                'Free lets every edge move independently. The ratio presets hold a shape while you resize the frame from any corner.',
            },
            {
              title: 'Position the frame',
              detail:
                'Drag the body to move it, drag a corner handle to resize it, or use the arrow keys to nudge by one pixel — Shift for ten. The numeric fields update as you go.',
            },
            {
              title: 'Or type the numbers',
              detail:
                'X, Y, width and height accept exact values and clamp themselves to the image, so you cannot ask for a region that runs off the edge.',
            },
            {
              title: 'Download the region',
              detail:
                'The output line shows the exact dimensions and the encoded size. The file is named with the new size so it is easy to find later.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="The controls and what they change">
        <DefinitionList
          items={[
            {
              term: 'Ratio',
              detail:
                'Free, 1:1, 4:3, 3:2, 16:9 or 9:16. Picking a preset keeps the frame’s current width, derives the height from the ratio, and keeps the frame centred where it already was. “Centre the frame” then fits the largest frame of that shape on the image.',
            },
            {
              term: 'X and Y',
              detail:
                'The top-left corner of the crop, in pixels from the image’s top-left corner. Values beyond the image edge are pulled back inside.',
            },
            {
              term: 'Width and height',
              detail:
                'The size of the kept region. The minimum is 16 pixels on each side; the maximum is whatever fits from the chosen corner.',
            },
            {
              term: 'Output format',
              detail:
                'Keep the source format or write JPG, PNG or WebP. Only formats the browser has proven it can encode are listed.',
            },
            {
              term: 'Quality',
              detail:
                'Appears for lossy formats. It starts at 88 here because a crop is usually a finishing step and you rarely want to lose much detail at this point.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="Where the cropper stops">
        <p>
          Any image the browser can decode can be cropped, including JPG, PNG, WebP, GIF, BMP and
          in most browsers AVIF. Output is JPG, PNG, WebP, or AVIF where the encoder test passes.
        </p>
        <LimitList
          items={[
            'The crop is rectangular. Circles, rounded corners and freehand shapes are not something this tool draws — crop to a square and apply the mask in the tool that needs it.',
            'Rotation is a separate step. If a horizon needs levelling, use the rotate tool first; this cropper does not rotate by arbitrary angles.',
            'A cropped JPG is re-encoded. Writing PNG avoids that loss at the cost of a larger file.',
            'Metadata is not carried through. A cropped photo has no EXIF, GPS or colour profile tags.',
            'Images beyond roughly 100 megapixels are refused up front because the canvas cannot usually be allocated.',
            'Animated files are cropped on their first frame only.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="A 16:9 thumbnail from a landscape photo">
        <p>
          A 4032 × 3024 photograph is 4:3. Choosing <strong>16:9</strong> drops a 4032 × 2268 frame
          across the full width, centred vertically. Dragging it up or down picks which band of
          the picture survives; the width stays at 4032 because there is nowhere wider to go.
          Downloading at this point gives a 16:9 image at full resolution.
        </p>
        <p>
          If the destination needs exactly 1280 × 720, that is a resize rather than a crop: send
          the result through the{' '}
          <Link href="/image-resizer/" className="text-signal underline underline-offset-2">
            image resizer
          </Link>{' '}
          with the width set to 1280 and the ratio locked. The height will come out at 720 because
          the shape is already correct.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why crop here">
        <BenefitList
          items={[
            {
              title: 'Drag or type — same result',
              detail:
                'The frame and the number fields describe one rectangle. Whatever you set last wins, and the other view follows exactly.',
            },
            {
              title: 'Pixel-exact',
              detail:
                'The output is the region you asked for, to the pixel. The readout reports the actual dimensions of the encoded file.',
            },
            {
              title: 'Keyboard operable',
              detail:
                'The frame can be focused and nudged with arrow keys, and every field has a label, so the tool works without a pointer.',
            },
            {
              title: 'No upload delay',
              detail:
                'The picture is decoded once on your device; moving the frame is instant because nothing has to be recomputed on a server.',
            },
            {
              title: 'No account, no watermark',
              detail:
                'Nothing gates the download. The tool is the whole product.',
            },
            {
              title: 'Private by construction',
              detail:
                'The tool has no upload path at all, so there is no server-side copy to worry about deleting later.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="Where the photo goes while you crop it">
        <p>
          Nowhere. It is decoded into this tab’s memory, displayed, and the selected region is
          copied to a new canvas and encoded there. No request carrying the image is made, and no
          part of it is written to local storage, a cache or a cookie. Loading another file or
          closing the tab releases it.
        </p>
        <p>
          The page itself sets no cookies and runs no analytics. The server that served it can log
          the page request — as any web host can — and the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          describes exactly what that means.
        </p>
      </Section>
    </ToolPage>
  );
}
