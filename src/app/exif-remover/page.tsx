import type { Metadata } from 'next';
import Link from 'next/link';
import { BenefitList, DefinitionList, LimitList, Section, Steps } from '@/components/content/Section';
import { ToolPage } from '@/components/content/ToolPage';
import { ExifTool } from '@/components/tools/ExifTool';
import { toolMetadata, type FaqItem } from '@/lib/seo';
import { getTool } from '@/lib/tools';

const SLUG = 'exif-remover';

export const metadata: Metadata = toolMetadata(getTool(SLUG));

const FEATURES = [
  'See the EXIF, GPS and XMP data a photo carries',
  'Remove metadata from JPG, PNG and WebP without re-compressing',
  'Optionally keep the colour profile',
  'Re-reads the cleaned file to check the removal',
  'Runs in the browser with no upload',
];

const FAQ: FaqItem[] = [
  {
    q: 'Do my photos really contain my location?',
    a: 'Many do. Phones write GPS coordinates into the photo file when location services are on for the camera, and those coordinates travel with the file when you send it. This tool reads them first and shows the latitude and longitude so you can see exactly what is there before deciding anything.',
  },
  {
    q: 'Does removing EXIF reduce image quality?',
    a: 'Not for JPG, PNG or WebP. For those three the tool rewrites the container without the metadata blocks and copies the compressed picture data across byte for byte, so the pixels are identical to the original. Only for other formats does it fall back to re-encoding, and it tells you when that happens.',
  },
  {
    q: 'What exactly is removed?',
    a: 'EXIF, XMP, IPTC, Photoshop resource blocks, comments and the GPS block — everything the container holds that is not the picture itself. The colour profile is kept by default because it affects how colours display and says nothing about you; one toggle removes it too.',
  },
  {
    q: 'How do I know the metadata is actually gone?',
    a: 'The tool reads the cleaned file back with the same parser it used on the original and reports what it finds. If tags remain it says how many rather than claiming success. That is a verification of what this parser can read, not a legal guarantee — for evidence-grade work, check the file in a dedicated forensic tool as well.',
  },
  {
    q: 'Does social media strip metadata anyway?',
    a: 'Most large platforms remove most of it on upload, but the file reaches their servers intact first, and the behaviour differs between platforms, between upload paths and over time. Direct sharing — email, chat attachments, file transfers, a website you run — usually strips nothing at all. Cleaning before you send is the only part you control.',
  },
  {
    q: 'Is the photo uploaded to be cleaned?',
    a: 'No. The metadata is parsed and the clean copy written in this tab. A photo that carries your home coordinates is precisely the file that should not be sent to a server to have those coordinates removed.',
  },
];

export default function ExifRemoverPage() {
  return (
    <ToolPage
      slug={SLUG}
      workspace={<ExifTool />}
      features={FEATURES}
      faq={FAQ}
      relatedIntro="Other pages that also write metadata-free output, and the checker that reads a file without changing it."
    >
      <Section id="overview" eyebrow="Overview" title="See it first, then remove it">
        <p>
          A photograph is not only a picture. Cameras and phones write a second layer into the file:
          the make and model, the lens, the shutter speed, the date and time to the second, the
          software that last touched it, sometimes a copyright line, and — the one that matters most
          — the exact coordinates where the shutter was pressed. None of it is visible when you look
          at the image, and all of it travels with the file when you send it.
        </p>
        <p>
          This page does two things in order. It shows you what is actually in your file, grouped and
          labelled, with any GPS coordinates spelled out. Then it writes a copy without them, and
          reads that copy back to check the removal worked.
        </p>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="Inspect, clean, verify">
        <Steps
          items={[
            {
              title: 'Drop the photo',
              detail:
                'A metadata parser is loaded on demand and the file is read in the page. Nothing is sent anywhere.',
            },
            {
              title: 'Read what is there',
              detail:
                'Tags are grouped into location, camera and lens, capture settings, dates, software and authorship, and image properties. A location group is highlighted and the coordinates are shown.',
            },
            {
              title: 'Choose whether to keep the colour profile',
              detail:
                'Kept by default. It describes how colours should be rendered, carries nothing personal, and removing it can shift colours on some screens.',
            },
            {
              title: 'Write the clean copy',
              detail:
                'For JPG, PNG and WebP the container is rewritten without the metadata blocks and the compressed picture data is copied across untouched. Other formats are drawn and written as a fresh JPG instead, which the tool warns you about first.',
            },
            {
              title: 'Verify, then download',
              detail:
                'The cleaned bytes are parsed again and the result reported: no readable tags, or the number that remain. The download is named with a “-clean” suffix so the original is never overwritten.',
            },
          ]}
        />
      </Section>

      <Section id="settings" eyebrow="Settings" title="The one decision, and what each reading means">
        <DefinitionList
          items={[
            {
              term: 'Keep the colour profile',
              detail:
                'On by default. An ICC profile tells a display how to interpret the colours. It is not personal data. Turn it off only if you want the file reduced to pixels and nothing else.',
            },
            {
              term: 'Tags found',
              detail:
                'How many readable metadata entries the parser recovered from the original. Zero means the file was already clean, or the format never carried any.',
            },
            {
              term: 'Location data',
              detail:
                '“Present” with coordinates, or “none found”. This is the reading most people come here for.',
            },
            {
              term: 'Cleaned size',
              detail:
                'The size of the clean copy. For a lossless clean the difference is the container data that was dropped — often 10 KB to 100 KB on a phone photo with a thumbnail embedded.',
            },
            {
              term: 'Method',
              detail:
                'The download bar says “pixels untouched” for a lossless clean and “re-encoded” for the fallback path, so you always know which one you got.',
            },
          ]}
        />
      </Section>

      <Section id="formats" eyebrow="Formats and limits" title="What this can and cannot promise">
        <LimitList
          items={[
            'The verification is a re-read with the same parser. It confirms that no readable EXIF, XMP or comment tags remain — it cannot prove that nothing at all is left in every byte of the file.',
            'Only JPG, PNG and WebP are cleaned losslessly. Other formats are re-encoded as JPG, which compresses the picture once.',
            'Removing metadata does not anonymise the picture itself. Faces, street signs, screens and reflections are still in the image, and so are any watermarks.',
            'Sensor noise patterns and compression characteristics can in principle link a photo to a camera. Stripping tags does not change that.',
            'The colour profile is kept unless you turn the toggle off; that is a deliberate default, not an oversight.',
            'A file already stripped by another tool will show zero tags. The clean copy is then simply a re-write with nothing to take out.',
          ]}
        />
      </Section>

      <Section id="example" eyebrow="Worked example" title="A phone photo before it goes into a listing">
        <p>
          A photo taken at home to sell a sofa online typically carries the phone make and model, the
          lens, the exposure settings, the date and time, and coordinates accurate to a few metres.
          Dropped here, the location group appears first with the latitude and longitude written out.
          Cleaning removes every one of those blocks; the copy is usually 20 KB to 80 KB smaller
          purely from the embedded thumbnail and tag data, and the picture is pixel for pixel the
          same.
        </p>
        <p>
          If the listing site also caps the file size, run the clean copy through the{' '}
          <Link href="/image-compressor/" className="text-signal underline underline-offset-2">
            compressor
          </Link>{' '}
          — its output carries no metadata either. To check a file without changing it, the{' '}
          <Link href="/image-dimensions-checker/" className="text-signal underline underline-offset-2">
            dimensions checker
          </Link>{' '}
          reads and reports only.
        </p>
      </Section>

      <Section id="why" eyebrow="Why use this" title="Why clean here">
        <BenefitList
          items={[
            {
              title: 'You see it before you delete it',
              detail:
                'The tags are listed and grouped first. Knowing what your camera has been recording is worth as much as removing it.',
            },
            {
              title: 'Pixels untouched',
              detail:
                'JPG, PNG and WebP are cleaned by rewriting the container, so the picture data is copied across exactly as it was.',
            },
            {
              title: 'The claim is checked',
              detail:
                'The cleaned file is parsed again and the result reported honestly, including when tags remain.',
            },
            {
              title: 'The file never leaves the device',
              detail:
                'Uploading a geotagged photo to a server in order to remove the geotag would defeat the purpose entirely.',
            },
            {
              title: 'Colour handled sensibly',
              detail:
                'The colour profile is kept by default so cleaned photos do not come back looking washed out, with a toggle if you want it gone.',
            },
            {
              title: 'No account, no watermark',
              detail: 'Inspect and clean as many files as you like; nothing is gated or stamped.',
            },
          ]}
        />
      </Section>

      <Section id="privacy" eyebrow="Privacy" title="The one page where this matters most">
        <p>
          The photo is read and rewritten in this tab. No upload request is made, the metadata is
          parsed on your device, and nothing — not the file, not the coordinates, not the tag list —
          is written to local storage, a cache or a cookie. Loading another image or closing the page
          releases all of it.
        </p>
        <p>
          The page sets no cookies and loads no analytics. The host that served it can log the page
          request itself — IP address, timestamp, user agent — as every web host can. That is the
          full extent of what happens, and the{' '}
          <Link href="/privacy/" className="text-signal underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          states it in the same terms rather than promising more.
        </p>
      </Section>
    </ToolPage>
  );
}
