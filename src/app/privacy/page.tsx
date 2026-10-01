import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection, type LegalTocItem } from '@/components/content/LegalPage';
import { pageMetadata, webPageJsonLd } from '@/lib/seo';
import { BRAND, CONTACT_EMAIL, LEGAL_LAST_UPDATED } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Promise: Your Photos Never Leave Your Phone or PC',
  description:
    'PixelEditor privacy policy: images are processed in your browser without server uploads. Clear information on web host logs, cookies, and local execution.',
  keywords: [
    'PixelEditor privacy policy',
    'local image processing privacy',
    'browser based image tools privacy',
    'client-side image processing privacy',
    'private image editor data policy',
  ],
  path: '/privacy/',
});

const TOC: LegalTocItem[] = [
  { id: 'summary', title: 'The short version' },
  { id: 'images', title: 'What happens to your images' },
  { id: 'collected', title: 'What data we collect' },
  { id: 'hosting', title: 'What the web host can see' },
  { id: 'cookies', title: 'Cookies, storage and analytics' },
  { id: 'third-parties', title: 'Third parties' },
  { id: 'email', title: 'If you email us' },
  { id: 'security', title: 'Security and its limits' },
  { id: 'rights', title: 'Your rights' },
  { id: 'children', title: 'Children' },
  { id: 'changes', title: 'Changes to this policy' },
  { id: 'contact', title: 'Contact' },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      deck={`How ${BRAND} handles your images and your data — written to match what the code actually does, including the parts we cannot control.`}
      path="/privacy/"
      toc={TOC}
      jsonLd={[
        webPageJsonLd({
          name: `Privacy Policy — ${BRAND}`,
          description:
            'PixelEditor privacy policy: images are processed in your browser without server uploads. Clear information on web host logs, cookies, and local execution.',
          path: '/privacy/',
          dateModified: LEGAL_LAST_UPDATED,
        }),
      ]}
    >
      <LegalSection id="summary" title="The short version">
        <p>
          Your images are processed by your own browser and are never sent to us. {BRAND} sets no
          cookies, runs no analytics, has no accounts and no database, and loads nothing from
          third-party servers. There is no upload endpoint, because there is no server-side
          processing at all.
        </p>
        <p>
          What we cannot honestly claim is that nothing whatsoever is recorded anywhere. Serving a
          web page requires a web server, and web servers keep request logs. That is described in
          full below rather than glossed over.
        </p>
      </LegalSection>

      <LegalSection id="images" title="What happens to your images">
        <p>
          Every tool on this site runs inside the page you have open. When you select or drag an
          image in, the file is read into your browser tab’s memory and decoded there. Resizing,
          cropping, rotating, compressing, converting and metadata removal are performed by your
          browser’s own graphics and encoding functions, on your device’s processor. Heavier work is
          handed to a Web Worker, which is simply a background thread in the same browser tab.
        </p>
        <p>
          The result is turned back into a file in the page, and the download is produced from that
          in-memory file. ZIP archives for the batch tools are assembled in the page in the same way.
        </p>
        <p>
          <strong>
            No image, and no part of an image, is transmitted to {BRAND} or to anyone else by this
            site.
          </strong>{' '}
          There is no code in the site that sends file data anywhere: no upload request, no
          background reporting, no telemetry about your files. Images are not written to cookies,
          local storage, session storage, IndexedDB, or any cache under our control.
        </p>
        <p>
          Your files exist only for as long as the page holds them. Reloading the page, closing the
          tab, or loading a different image releases them. Nothing persists between visits, which is
          also why no tool can show you a history of what you processed earlier.
        </p>
      </LegalSection>

      <LegalSection id="collected" title="What data we collect">
        <p>
          {BRAND} operates no accounts, no sign-in, no forms, no newsletter, no comment system and no
          user database. We do not ask for your name, your email address or any other personal
          detail in order to use any tool. There is nothing for us to store about you, and nothing we
          could sell or share, because none of it is collected in the first place.
        </p>
        <p>
          The site does not send any information about your use of the tools — which pages you
          opened, which settings you chose, how many files you processed — to us or to anyone else.
        </p>
      </LegalSection>

      <LegalSection id="hosting" title="What the web host can see">
        <p>
          This is the part most “100% private” claims leave out, so it is stated plainly. The pages,
          stylesheets, fonts and JavaScript files that make up this site have to be downloaded from a
          web server before anything can run. Like essentially every web server in existence, the
          hosting provider that serves those files can record standard request information, typically
          including:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>your IP address;</li>
          <li>the date and time of the request;</li>
          <li>the page or file requested;</li>
          <li>your browser’s user-agent string, and sometimes the referring page.</li>
        </ul>
        <p>
          These logs concern the delivery of the web page itself. They do not contain your images,
          because your images are never part of any request. We do not use such logs for profiling,
          advertising or analytics, and the retention period is determined by the hosting provider
          rather than by us.
        </p>
        <p>
          If you would like to reduce even that footprint, the practical answer is the usual one: a
          VPN or privacy-respecting network changes what the host sees about your connection. Once
          the page has loaded, you can disconnect from the internet entirely and the tools will
          continue to work.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies, storage and analytics">
        <p>
          {BRAND} sets no cookies of any kind — not for processing, not for preferences, not for
          measurement. There is no cookie banner because there is nothing to consent to.
        </p>
        <p>
          The site does not write to local storage, session storage or IndexedDB. Your tool settings
          are not remembered between visits, which is a consequence of that choice rather than an
          oversight.
        </p>
        <p>
          There is no analytics package on this site: no Google Analytics, no privacy-friendly
          alternative, no pixel, no heatmap, no A/B testing script, no error-reporting service. The{' '}
          <Link href="/cookies/">Cookie Policy</Link> covers this in more detail, including what
          would have to change before this section could.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="Third parties">
        <p>
          Loading a page of this site does not cause requests to any third-party domain. In
          particular:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Fonts are self-hosted.</strong> They are downloaded and served from this site at
            build time, so no font provider receives a request or an IP address when you visit.
          </li>
          <li>
            <strong>No third-party scripts.</strong> No tag manager, advertising network, social
            widget, chat widget, CAPTCHA or embedded video.
          </li>
          <li>
            <strong>No content delivery network for third-party libraries.</strong> The image-parsing
            and ZIP libraries the tools use are bundled into this site and loaded from this site’s
            own address, on demand, the first time a tool needs them.
          </li>
        </ul>
        <p>
          Two parties are unavoidably involved in any website: the hosting provider that serves these
          files, and your own browser, which does the image processing. Your browser is software you
          control, and it is the only thing that ever sees your images.
        </p>
      </LegalSection>

      <LegalSection id="email" title="If you email us">
        <p>
          If you contact us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, we will have your email address
          and whatever you choose to put in the message, held in an ordinary email account so that we
          can reply. We do not add correspondents to a mailing list and we do not use messages for
          marketing.
        </p>
        <p>
          Please do not send us your images. We have no need for them, no tool on this site requires
          them, and email is not a private channel.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Security and its limits">
        <p>
          Processing images locally removes the largest risk in an online image tool — the risk of a
          server holding your files and that server being breached, subpoenaed, sold or
          misconfigured. There is no such server here and no stored copy to lose.
        </p>
        <p>
          It does not make your device secure, and we will not claim otherwise. We cannot make
          guarantees about:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            software on your own device — malware, a compromised browser, a screen-capturing
            extension or an extension with permission to read page content;
          </li>
          <li>
            your browser’s own behaviour, including its handling of downloads and its cache of site
            files;
          </li>
          <li>
            a network operator or intermediary observing that you requested pages from this domain,
            which is visible at the connection level even over HTTPS;
          </li>
          <li>what happens to a processed file after you download and share it.</li>
        </ul>
        <p>
          No website can honestly promise absolute security or complete anonymity, and this one does
          not. For genuinely sensitive material, handle it the way you would handle any sensitive
          file: on a device you trust, with software you have checked.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Your rights">
        <p>
          Data-protection laws such as the UK GDPR, the EU GDPR and the CCPA give you rights over
          personal data held about you — to access it, correct it, delete it, or object to its use.
          Those rights are easy to satisfy here because we hold almost nothing: no account, no
          profile, no image, no usage history.
        </p>
        <p>
          The exceptions are the hosting provider’s server logs described above, and any email you
          have sent us. If you believe those contain data about you and you want to ask about it,
          write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will do what we
          reasonably can, bearing in mind that we cannot identify which log entries belong to you
          unless you can tell us.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          {BRAND} is a general-purpose utility and is not directed at children. Because it collects
          no personal information from anyone, it collects none from children either.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this policy">
        <p>
          If the site changes in a way that affects this policy — if analytics were ever added, or a
          feature that stores preferences on your device — this page will be updated before or at the
          same time as that change, and the date at the top will move.
        </p>
        <p>
          This policy describes the site as it currently stands. It is not a promise about future
          versions, and we would rather revise it honestly than leave a flattering description in
          place.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about this policy can go to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also the{' '}
          <Link href="/terms/">Terms of Service</Link>, the <Link href="/cookies/">Cookie Policy</Link>{' '}
          and <Link href="/about/">About {BRAND}</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
