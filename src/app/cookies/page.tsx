import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection, type LegalTocItem } from '@/components/content/LegalPage';
import { pageMetadata, webPageJsonLd } from '@/lib/seo';
import { BRAND, CONTACT_EMAIL, LEGAL_LAST_UPDATED } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: `Cookie Policy — Why This Site Sets No Tracking Cookies`,
  description:
    'PixelEditor sets no tracking or marketing cookies and loads no analytics scripts. Read why our tools need no cookie consent banner and how your data is handled.',
  keywords: [
    'PixelEditor cookie policy',
    'no tracking cookies image editor',
    'why no cookie banner',
    'browser image tools cookie policy',
  ],
  path: '/cookies/',
});

const TOC: LegalTocItem[] = [
  { id: 'position', title: 'The position in one line' },
  { id: 'what-are-cookies', title: 'What cookies are' },
  { id: 'why-none', title: 'Why this site does not need them' },
  { id: 'storage', title: 'Other browser storage' },
  { id: 'analytics', title: 'Analytics and tracking' },
  { id: 'third-parties', title: 'Third-party cookies' },
  { id: 'cache', title: 'What your browser still does' },
  { id: 'downloads', title: 'Files you download' },
  { id: 'no-banner', title: 'Why there is no cookie banner' },
  { id: 'control', title: 'Controlling cookies yourself' },
  { id: 'changes', title: 'If this ever changes' },
  { id: 'contact', title: 'Contact' },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      deck={`${BRAND} sets no cookies at all. This page explains what that covers, what it does not cover, and what your browser does on its own account.`}
      path="/cookies/"
      toc={TOC}
      jsonLd={[
        webPageJsonLd({
          name: `Cookie Policy — ${BRAND}`,
          description:
            'PixelEditor sets no tracking or marketing cookies and loads no analytics scripts. Read why our tools need no cookie consent banner and how your data is handled.',
          path: '/cookies/',
          dateModified: LEGAL_LAST_UPDATED,
        }),
      ]}
    >
      <LegalSection id="position" title="The position in one line">
        <p>
          <strong>This site sets no cookies.</strong> Not for image processing, not for preferences,
          not for measurement, not for advertising. There are no first-party cookies and no
          third-party cookies, because there is no third-party code on the site to set them.
        </p>
      </LegalSection>

      <LegalSection id="what-are-cookies" title="What cookies are">
        <p>
          A cookie is a small piece of text a website asks your browser to store and send back on
          later requests. Cookies are how sites keep you signed in, remember a shopping basket, or
          recognise a returning visitor across days and — in the advertising case — across other
          sites entirely.
        </p>
        <p>
          They are a mechanism for carrying state between your browser and a server. {BRAND} has no
          server-side state to carry, so it has no use for the mechanism.
        </p>
      </LegalSection>

      <LegalSection id="why-none" title="Why this site does not need them">
        <p>
          Every tool here runs inside the page while it is open. Your image is held in the tab’s
          memory, processed there, and released when you reload or close the page. None of that
          involves a cookie: a cookie could not hold an image, and there is no server session for it
          to identify.
        </p>
        <p>
          There are no accounts, so nothing to sign in to. There is no basket, no saved history, no
          cross-visit recognition of any kind. Your tool settings are not remembered between visits —
          that is the trade-off for storing nothing about you, and it is deliberate.
        </p>
      </LegalSection>

      <LegalSection id="storage" title="Other browser storage">
        <p>
          Cookies are not the only way a site can keep data on your device, so for completeness:{' '}
          {BRAND} does not write to local storage, session storage or IndexedDB either, and it does
          not install a service worker. Your images are never written to any of them.
        </p>
        <p>
          The only data that exists while you use a tool is held in the page’s memory, and the
          browser reclaims it when the page goes away.
        </p>
      </LegalSection>

      <LegalSection id="analytics" title="Analytics and tracking">
        <p>
          There is no analytics on this site. No Google Analytics, no privacy-friendly analytics
          alternative, no tracking pixel, no heatmap or session-recording tool, no A/B testing
          script, no advertising or remarketing tag, no error-reporting service that phones home.
        </p>
        <p>
          This means we genuinely do not know how many people use the site or which tools are
          popular, beyond whatever the hosting provider’s own request logs show. The{' '}
          <Link href="/privacy/">Privacy Policy</Link> explains what those logs contain, since a web
          host that serves pages inevitably records requests.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="Third-party cookies">
        <p>
          Third-party cookies are usually set by embedded content: advertising networks, social
          buttons, embedded videos, chat widgets, hosted fonts and CAPTCHAs. This site embeds none of
          those.
        </p>
        <p>
          Fonts are self-hosted, so no font provider is contacted when you open a page. The
          image-metadata and ZIP libraries the tools use are bundled into the site and loaded from
          this site’s own address when a tool first needs them — not fetched from anyone else’s
          content delivery network. Loading any page here produces no request to a third-party
          domain, which is the reason there are no third-party cookies to describe.
        </p>
      </LegalSection>

      <LegalSection id="cache" title="What your browser still does">
        <p>
          Your browser does its own housekeeping for every website you visit, including this one, and
          we neither control nor rely on it:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Caching site files.</strong> Pages, stylesheets, fonts and scripts may be stored
            in the browser’s cache so the site loads faster next time. This is the browser’s standard
            behaviour for static files; it is not a cookie, it identifies nobody, and it contains
            none of your images.
          </li>
          <li>
            <strong>History.</strong> The pages you visit appear in your browsing history, as with
            any site.
          </li>
        </ul>
        <p>
          Both are cleared with your browser’s normal “clear browsing data” controls, or avoided
          entirely by using a private window.
        </p>
      </LegalSection>

      <LegalSection id="downloads" title="Files you download">
        <p>
          When you download a processed image or a ZIP archive, your browser saves it where it saves
          downloads. That file is then an ordinary file on your device, under your control and
          outside the scope of this site. If you were processing something sensitive, remember that
          the downloaded copy stays in your downloads folder until you move or delete it.
        </p>
      </LegalSection>

      <LegalSection id="no-banner" title="Why there is no cookie banner">
        <p>
          Consent banners exist because sites place cookies that are not strictly necessary, and the
          law requires consent for those. A site that sets no cookies at all has nothing to ask
          consent for, so a banner here would be theatre — and a pointless obstacle between you and
          the tool you came to use.
        </p>
        <p>
          It would also break a rule this project holds to: nothing may overlay or interfere with
          selecting, editing, previewing or downloading an image. The legal documents live on their
          own pages, linked in the footer, and stay out of the way of the work.
        </p>
      </LegalSection>

      <LegalSection id="control" title="Controlling cookies yourself">
        <p>
          Nothing needs to be blocked for this site, but every major browser lets you view and delete
          cookies and block them by default, in its privacy or content settings. Blocking cookies
          entirely will not affect any tool here, since none are used. You can also verify this
          claim: open your browser’s developer tools, look at the storage or application panel while
          using any tool on this site, and check the cookie list for yourself.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="If this ever changes">
        <p>
          If a cookie or an analytics tool were ever introduced, this page would be updated to say
          exactly what it is and why, with the date at the top changed, and anything requiring
          consent would ask for it properly rather than assuming it. We would rather revise this
          document than keep a claim here that had stopped being true.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions can go to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also the{' '}
          <Link href="/privacy/">Privacy Policy</Link> and the{' '}
          <Link href="/terms/">Terms of Service</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
