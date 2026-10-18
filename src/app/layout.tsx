import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { BackgroundParticles } from '@/components/layout/BackgroundParticles';
import { JsonLd } from '@/components/layout/JsonLd';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { BRAND, SITE_URL, TAGLINE } from '@/lib/site';

/**
 * Fonts are downloaded at build time and served from this origin, so a visit
 * makes no request to any third party. That is what lets the privacy pages
 * say "no third-party scripts or fonts" without qualification.
 */
const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Every page supplies its own complete <title>; no "| Brand" template, so
  // no two pages end up with near-identical titles.
  title: {
    default: `${BRAND} — ${TAGLINE}`,
    template: '%s',
  },
  description:
    'Free image tools that resize, crop, compress, convert and clean metadata in your browser, with no upload step and no account.',
  applicationName: BRAND,
  appleWebApp: {
    capable: true,
    title: BRAND,
    statusBarStyle: 'default',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/icon-144.png', type: 'image/png', sizes: '144x144' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: BRAND,
    locale: 'en_US',
    url: `${SITE_URL}/`,
    title: `${BRAND} — ${TAGLINE}`,
    description:
      'Free image tools that resize, crop, compress, convert and clean metadata in your browser, with no upload step and no account.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${BRAND} — ${TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND} — ${TAGLINE}`,
    description:
      'Free image tools that resize, crop, compress, convert and clean metadata in your browser, with no upload step and no account.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f6f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f15' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('pixeleditor-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d)){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="relative min-h-screen bg-paper font-sans text-ink antialiased">
        <BackgroundParticles />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-instrument focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to main content
        </a>

        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader />

          <noscript>
            <p className="border-b border-caution bg-caution-soft px-4 py-2 text-center text-sm text-ink">
              The tools need JavaScript, because the image processing runs in this browser rather
              than on a server. The written guides on every page still read fine without it.
            </p>
          </noscript>

          <main id="main" className="flex-1">{children}</main>

          <SiteFooter />
        </div>

        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
      </body>
    </html>
  );
}
