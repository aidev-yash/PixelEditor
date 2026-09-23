import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection, type LegalTocItem } from '@/components/content/LegalPage';
import { aboutPageJsonLd, pageMetadata } from '@/lib/seo';
import { BRAND, CONTACT_EMAIL } from '@/lib/site';
import { toolHref, toolsByCategory } from '@/lib/tools';

export const metadata: Metadata = pageMetadata({
  title: `About ${BRAND} — Private Browser-Based Image Tools`,
  description:
    'Learn how PixelEditor processes images directly on your device using Canvas and Web Workers, why we never upload your files, and how our tools are built.',
  keywords: [
    'about PixelEditor',
    'browser image processing architecture',
    'how client side image editing works',
    'private image tools no upload',
    'browser based image editor',
  ],
  path: '/about/',
});

const TOC: LegalTocItem[] = [
  { id: 'what', title: 'What PixelEditor is' },
  { id: 'why', title: 'Why local processing' },
  { id: 'how', title: 'How it is built' },
  { id: 'claims', title: 'What we claim, and what we do not' },
  { id: 'who', title: 'Who this is for' },
  { id: 'tools', title: 'The tools' },
  { id: 'not', title: 'What this is not' },
  { id: 'cost', title: 'How it is paid for' },
  { id: 'contact', title: 'Contact' },
];

export default function AboutPage() {
  const groups = toolsByCategory();

  return (
    <LegalPage
      title={`About ${BRAND}`}
      deck="A small set of single-purpose image tools that never send your files anywhere — and a plain account of how that works and where its limits are."
      path="/about/"
      crumbName="About"
      toc={TOC}
      dated={false}
      jsonLd={[aboutPageJsonLd()]}
    >
      <LegalSection id="what" title={`What ${BRAND} is`}>
        <p>
          {BRAND} is a collection of image utilities that run inside your web browser. Resize, crop,
          rotate, compress, convert between formats, check dimensions, strip metadata, and do any of
          those to a folder of images at once. Each tool has its own page and its own address, so the
          one you keep needing can be bookmarked and opened directly.
        </p>
        <p>
          There is no account, no sign-in, no watermark, no paid tier that unlocks the real version,
          and no upload step. You open a page, drop in a file, and the work happens on your own
          machine.
        </p>
      </LegalSection>

      <LegalSection id="why" title="Why local processing">
        <p>
          The ordinary way to build an online image tool is to accept an upload, process the file on
          a server, and send the result back. It works, and it quietly creates a set of problems that
          have nothing to do with images.
        </p>
        <p>
          Your file leaves your device. It is transmitted across a network, written to a disk you do
          not control, and held there for however long that service decides. It can be logged,
          backed up, retained after deletion, examined by staff, exposed by a misconfiguration,
          inherited by whoever buys the company, or handed over on request. None of that requires bad
          intent from anyone — it is simply what having your file makes possible.
        </p>
        <p>
          Meanwhile the browser on your device has been able to decode, redraw and re-encode images
          for years. It is the obvious place to do this work: the file is already there, no network
          round trip is needed in either direction, and a server that never receives your photograph
          cannot lose it. That is the entire premise of this site.
        </p>
        <p>
          The practical benefits follow from the same design. Nothing waits in an upload queue, large
          files are not limited by someone else’s bandwidth allowance, and once the page has loaded
          the tools keep working with the network disconnected.
        </p>
      </LegalSection>

      <LegalSection id="how" title="How it is built">
        <p>
          Each tool reads your file into the page’s memory, decodes it into an image, redraws it onto
          a canvas with whatever change you asked for, and encodes the result back into a file. The
          browser’s own graphics and codec implementations do the heavy lifting; heavier jobs are
          handed to a Web Worker, which is a background thread in the same tab, so the interface
          stays responsive while a large photograph is processed.
        </p>
        <p>
          The site itself is a set of static files — HTML, CSS, JavaScript and fonts. There is no
          application server, no database and no API. That is not a detail of the hosting
          arrangement; it is the reason the privacy claims on this site can be specific. A backend
          that does not exist cannot store your images.
        </p>
        <p>
          A few smaller decisions follow the same logic. Fonts are downloaded at build time and
          served from this site, so no font provider sees your visit. The metadata parser and the ZIP
          builder are bundled into the site and loaded from it on demand rather than pulled from
          someone else’s content delivery network. Output formats are offered only after the browser
          has been asked to encode a tiny test image and has produced a valid result — which is why
          AVIF appears on some devices and not others, instead of failing silently after you have
          processed fifty files.
        </p>
      </LegalSection>

      <LegalSection id="claims" title="What we claim, and what we do not">
        <p>
          Plenty of tools advertise “100% private” and “zero data collection”. Those phrases are easy
          to write and almost impossible to support, so they are not used here. What is true is
          narrower and checkable:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Your images are processed in your browser and are not transmitted to us. There is no code
            in this site that sends file data anywhere.
          </li>
          <li>
            The site sets no cookies, runs no analytics and makes no third-party requests.
          </li>
          <li>
            Nothing you process is stored — not on a server, and not in your browser’s storage
            either.
          </li>
        </ul>
        <p>And what we will not claim:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            That nothing is recorded anywhere. A web host serves these pages and, like every web
            host, can log the request — IP address, timestamp, user agent. The{' '}
            <Link href="/privacy/">Privacy Policy</Link> says so.
          </li>
          <li>
            That your device is secure. Malware, a hostile browser extension or someone reading over
            your shoulder are outside anything this site can affect.
          </li>
          <li>
            That a target file size is guaranteed, or that metadata removal is forensically complete.
            The tools report what they measured and what they could verify, including when the answer
            is “not quite”.
          </li>
        </ul>
        <p>
          The same discipline applies to the tool pages: if a page describes a behaviour, that
          behaviour is in the code. Where a limit exists — fifty files per batch, first frame only
          for animation, transparency lost when converting to JPG — the page says so on the way in
          rather than leaving you to discover it afterwards.
        </p>
      </LegalSection>

      <LegalSection id="who" title="Who this is for">
        <p>
          Anyone with an image and a requirement attached to it. A photograph that has to be under
          500 KB for a form that keeps rejecting it. A folder of product shots that all need the same
          width. A screenshot that needs to become a JPG because the software at the other end is
          twenty years old. A picture of something you are selling that should not carry the
          coordinates of your home.
        </p>
        <p>
          It is particularly for people who should not be uploading their files at all: anyone
          handling medical images, legal exhibits, identity documents, client material under an
          agreement, or photographs of people who did not consent to a third party receiving them.
          For that work, “it is processed locally” is not a preference — it is the requirement.
        </p>
      </LegalSection>

      <LegalSection id="tools" title="The tools">
        <p>
          Every tool has a dedicated page explaining what it does, how it does it, and what it cannot
          do:
        </p>
        <div className="mt-6 space-y-5">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="font-mono text-2xs uppercase tracking-wider text-ink-muted">
                {group.category}
              </h3>
              <ul className="mt-2 space-y-1">
                {group.tools.map((tool) => (
                  <li key={tool.slug} className="text-sm">
                    <Link href={toolHref(tool.slug)} className="text-signal">
                      {tool.name}
                    </Link>
                    <span className="text-ink-muted"> — {tool.blurb}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="not" title="What this is not">
        <p>
          {BRAND} is not a photo editor. There are no filters, no retouching, no layers, no drawing
          tools and no AI features — no background removal, no upscaling, no generation. Those jobs
          want either a real editor or a server with a large model on it, and pretending otherwise
          would mean either doing them badly or sending your files away, which is the one thing this
          site exists to avoid.
        </p>
        <p>
          It is also not a storage service. Nothing is kept, so nothing can be retrieved later. If
          you close the tab before downloading a result, the work is gone and has to be done again —
          a fair trade for a tool that never holds your files in the first place.
        </p>
      </LegalSection>

      <LegalSection id="cost" title="How it is paid for">
        <p>
          A site made of static files that does no server-side work is inexpensive to run, which is
          what makes it possible to offer the tools free without advertising, without analytics, and
          without an upsell. There is no investor expecting your attention to be monetised, because
          there is nothing here that collects attention to sell.
        </p>
        <p>
          If that ever changed, the honest thing would be to say so on this page and in the{' '}
          <Link href="/privacy/">Privacy Policy</Link> rather than to let a flattering description
          stand after it stopped being true.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Corrections, bug reports and suggestions are welcome at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If something on a tool page
          describes behaviour that does not match what the tool actually does, that is a bug in the
          writing and worth reporting — please do not attach the image it happened with.
        </p>
        <p>
          The full terms are in the <Link href="/terms/">Terms of Service</Link>, and the site’s
          position on cookies is in the <Link href="/cookies/">Cookie Policy</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
