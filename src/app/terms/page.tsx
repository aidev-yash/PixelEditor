import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection, type LegalTocItem } from '@/components/content/LegalPage';
import { pageMetadata, webPageJsonLd } from '@/lib/seo';
import { BRAND, CONTACT_EMAIL, LEGAL_LAST_UPDATED } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service: Free & Safe Photo Editing Rules',
  description:
    'Terms of Service for PixelEditor: terms for using our free browser-based image tools, user responsibilities, local processing scope, and liability limits.',
  keywords: [
    'PixelEditor terms of service',
    'free online image tools terms',
    'client-side image tools terms of use',
  ],
  path: '/terms/',
});

const TOC: LegalTocItem[] = [
  { id: 'agreement', title: 'Agreement to these terms' },
  { id: 'service', title: 'What the service provides' },
  { id: 'local', title: 'Local processing, and what follows from it' },
  { id: 'your-responsibility', title: 'Your responsibility for your files' },
  { id: 'rights', title: 'Rights in the images you process' },
  { id: 'prohibited', title: 'Acceptable use' },
  { id: 'availability', title: 'Availability and changes to the tools' },
  { id: 'accuracy', title: 'Accuracy of results' },
  { id: 'no-warranty', title: 'No warranty' },
  { id: 'liability', title: 'Limitation of liability' },
  { id: 'ip', title: 'Our intellectual property' },
  { id: 'third-parties', title: 'Third-party software' },
  { id: 'privacy', title: 'Privacy' },
  { id: 'changes', title: 'Changes to these terms' },
  { id: 'law', title: 'Governing law' },
  { id: 'contact', title: 'Contact' },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      deck={`The terms on which ${BRAND} is offered. Short, specific to what this site actually does, and free of clauses about accounts and uploads that do not exist here.`}
      path="/terms/"
      toc={TOC}
      jsonLd={[
        webPageJsonLd({
          name: `Terms of Service — ${BRAND}`,
          description:
            'Terms of Service for PixelEditor: terms for using our free browser-based image tools, user responsibilities, local processing scope, and liability limits.',
          path: '/terms/',
          dateModified: LEGAL_LAST_UPDATED,
        }),
      ]}
    >
      <LegalSection id="agreement" title="Agreement to these terms">
        <p>
          By using {BRAND} you agree to these terms. If you do not agree with them, please do not use
          the site. There is no account to create and nothing to sign; using the tools is the
          acceptance.
        </p>
        <p>
          These terms are written to be read. Where a clause limits what you can expect from a free
          tool, it says so in ordinary language rather than burying it.
        </p>
      </LegalSection>

      <LegalSection id="service" title="What the service provides">
        <p>
          {BRAND} provides a set of image utilities that run in your web browser: resizing, cropping,
          rotating and flipping, compressing, converting between JPG, PNG, WebP and — where your
          browser supports it — AVIF, inspecting image dimensions, removing metadata, and batch
          versions of resizing, compressing and converting.
        </p>
        <p>
          The service is provided free of charge, without registration, and without any watermark
          applied to your output. We do not claim a commercial relationship with you, and you do not
          owe us anything for using it.
        </p>
      </LegalSection>

      <LegalSection id="local" title="Local processing, and what follows from it">
        <p>
          All image processing happens on your own device, inside your browser. We do not receive,
          store, transmit or process your images, and we have no technical means of seeing them. The{' '}
          <Link href="/privacy/">Privacy Policy</Link> describes this in detail.
        </p>
        <p>
          Two practical consequences follow, and both are part of this agreement:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>We cannot recover anything for you.</strong> There is no copy of your files on
            our side. If you close the tab before downloading a result, or lose a download, the work
            is simply gone and must be done again.
          </li>
          <li>
            <strong>Performance depends on your device.</strong> Speed, batch capacity and which
            output formats are available are determined by your browser and hardware, not by us. A
            phone with little free memory will manage fewer large images than a desktop computer.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="your-responsibility" title="Your responsibility for your files">
        <p>
          You are responsible for your own images and for keeping your own backups.{' '}
          <strong>Keep your originals.</strong> Compression, conversion, cropping and metadata
          removal change files, and several of those changes cannot be undone from the output alone.
          The tools never modify or delete the file you selected — they produce a new file for you to
          download — but once you replace an original on your own disk with a processed version,
          restoring it is your responsibility alone.
        </p>
        <p>
          You are also responsible for checking that a result is fit for your purpose before you rely
          on it: that a compressed photo still looks acceptable, that a converted file opens in the
          software you need, and that a cleaned file no longer contains what you wanted removed.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Rights in the images you process">
        <p>
          You keep every right you already had in the images you process here. We acquire no licence,
          no ownership and no interest in them — there is no mechanism by which we could, since the
          files never reach us.
        </p>
        <p>
          You confirm that you own the images you process, or otherwise have the right to process
          them. If you are editing someone else’s photograph, removing a copyright tag from a file,
          or preparing material you do not have permission to use, that is a matter between you and
          the rights holder. A tool that runs on your device does not grant you rights you do not
          have, and the responsibility for how it is used rests with you.
        </p>
      </LegalSection>

      <LegalSection id="prohibited" title="Acceptable use">
        <p>You agree not to use {BRAND}:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            to process material that is unlawful where you are, including child sexual abuse
            material, which must be reported to the authorities rather than edited;
          </li>
          <li>
            to infringe copyright, trade marks, privacy rights or any other rights of another person;
          </li>
          <li>
            to produce images intended to deceive, harass, defame or impersonate, or to strip
            metadata for the purpose of concealing the origin of stolen or unlawfully obtained
            material;
          </li>
          <li>
            to attempt to interfere with the site, its hosting, or other people’s use of it, or to
            probe it for vulnerabilities in a way that disrupts service;
          </li>
          <li>
            to present the site as your own, or to resell access to it as though it were your
            product.
          </li>
        </ul>
        <p>
          Because processing is local, we have no ability to monitor what you do with these tools and
          no content-moderation capability. That is a deliberate design choice and it makes your own
          compliance with the law entirely your responsibility.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="Availability and changes to the tools">
        <p>
          The site is offered as it is, when it is available. We do not promise uptime, and we may
          change, suspend or discontinue any tool, or the whole site, at any time and without notice.
          Pages may be renamed or removed as the site develops.
        </p>
        <p>
          Some capabilities depend on your browser and can disappear or appear without any change on
          our side. AVIF output, for example, is offered only when your browser has demonstrated that
          it can encode AVIF. Older browsers may not support features the tools rely on at all.
        </p>
      </LegalSection>

      <LegalSection id="accuracy" title="Accuracy of results">
        <p>
          The tools report what they measure: file sizes, dimensions, the metadata a parser could
          read. We aim for those readings to be correct, but they describe what the software observed
          on your device and are not certified measurements.
        </p>
        <p>
          Where a tool aims at a target file size, that target is aimed at rather than guaranteed;
          the relevant page explains why. Where a tool verifies that metadata has been removed, it
          does so by re-reading the file with the same parser — a meaningful check, but not a
          forensic guarantee that nothing remains in every byte of the file. If you need
          evidence-grade assurance, verify the output with dedicated forensic software as well.
        </p>
      </LegalSection>

      <LegalSection id="no-warranty" title="No warranty">
        <p>
          {BRAND} is provided “as is” and “as available”, without warranties of any kind, whether
          express or implied, including any implied warranty of merchantability, fitness for a
          particular purpose or non-infringement. We do not warrant that the site will be
          uninterrupted, error-free, or free of defects, or that results will meet your requirements.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, we are not liable for any loss or damage arising
          from your use of {BRAND}, including loss of data, loss of images, loss of profits, business
          interruption, or any indirect or consequential loss — including where a processed image
          turns out not to be suitable, where a result is lost because a tab was closed, or where a
          file did not meet a limit imposed by someone else’s system.
        </p>
        <p>
          Nothing in these terms excludes or limits liability that cannot lawfully be excluded or
          limited, including liability for death or personal injury caused by negligence, or for
          fraud. If you are a consumer, your statutory rights are unaffected.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="Our intellectual property">
        <p>
          The {BRAND} name, the design of this site, its written content and its source code belong
          to the operator of the site, except where third-party components are used under their own
          licences. You may use the tools freely for any lawful purpose, including commercial work;
          that permission does not extend to copying the site itself and presenting it as your own.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="Third-party software">
        <p>
          The site is built with open-source software, and the tools use small open-source libraries
          for reading image metadata and for creating ZIP archives. These are bundled into the site
          and served from it rather than loaded from anyone else’s servers, so using {BRAND} does not
          put you in a relationship with a third party. Those components remain subject to their own
          licences, and their authors provide them without warranty in the same way.
        </p>
      </LegalSection>

      <LegalSection id="privacy" title="Privacy">
        <p>
          How your images and data are handled is set out in the{' '}
          <Link href="/privacy/">Privacy Policy</Link>, and the site’s position on cookies and
          analytics is set out in the <Link href="/cookies/">Cookie Policy</Link>. Both form part of
          your use of the site and are written to describe the implementation accurately rather than
          to flatter it.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to these terms">
        <p>
          These terms may be updated as the site changes. The current version is always the one on
          this page, with its date at the top. Continuing to use the site after a change means you
          accept the revised terms; if you do not, the remedy is simply to stop using the site.
        </p>
      </LegalSection>

      <LegalSection id="law" title="Governing law">
        <p>
          These terms are governed by the laws of the jurisdiction in which the operator of this site
          is established. If you use {BRAND} as a consumer, this does not deprive you of the
          protection of mandatory rules of law in your own country of residence.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about these terms can go to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. There is more about the project
          and the people behind it on <Link href="/about/">About {BRAND}</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
