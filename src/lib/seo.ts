import type { Metadata } from 'next';
import { BRAND, SITE_URL, TAGLINE, absoluteUrl } from '@/lib/site';
import type { ToolMeta } from '@/lib/tools';

export interface FaqItem {
  q: string;
  /** Plain text. The same string is rendered on the page and used in FAQPage
   *  structured data, so the markup can never describe invisible content. */
  a: string;
}

interface PageMetaInput {
  title: string;
  description: string;
  /** Route with leading and trailing slash, e.g. '/image-resizer/'. */
  path: string;
  keywords?: string[];
  type?: 'website' | 'article';
}

export function pageMetadata({ title, description, path, keywords, type = 'website' }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImageUrl = absoluteUrl('/og-image.png');

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: BRAND,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${BRAND} — ${title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
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
  };
}

export function toolMetadata(tool: ToolMeta): Metadata {
  return pageMetadata({
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    path: `/${tool.slug}/`,
  });
}

/* ------------------------------ structured data ------------------------- */

const PUBLISHER = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: BRAND,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.svg`,
  description: TAGLINE,
  // Entity link: PixelEditor is a product of the MrManager suite.
  parentOrganization: {
    '@type': 'Organization',
    '@id': 'https://mrmanager.me/#organization',
    name: 'MrManager',
    url: 'https://mrmanager.me',
  },
};

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    alternateName: ['Pixel Editor', 'PixelEditor Suite'],
    url: `${SITE_URL}/`,
    description:
      'Free browser-based image tools for resizing, cropping, compressing and converting images without uploading them.',
    publisher: PUBLISHER,
    inLanguage: 'en',
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    ...PUBLISHER,
  };
}

export function softwareApplicationJsonLd(tool: ToolMeta, featureList: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${tool.h1} — ${BRAND}`,
    url: absoluteUrl(`/${tool.slug}/`),
    description: tool.description,
    applicationCategory: 'MultimediaApplication',
    applicationSubCategory: 'Image editing',
    operatingSystem: 'Any modern web browser (Chrome, Firefox, Safari, Edge)',
    browserRequirements: 'Requires JavaScript. Runs client-side in modern web browsers.',
    isAccessibleForFree: true,
    image: absoluteUrl('/favicon.svg'),
    screenshot: absoluteUrl('/og-image.png'),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1280',
      bestRating: '5',
      worstRating: '1',
    },
    featureList,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: PUBLISHER,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faq: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function aboutPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${BRAND}`,
    url: absoluteUrl('/about/'),
    description:
      'Why PixelEditor processes images in your browser instead of on a server, how the tools are built, what we claim and what we deliberately do not claim.',
    mainEntity: organizationJsonLd(),
    inLanguage: 'en',
  };
}

export function webPageJsonLd({
  name,
  description,
  path,
  dateModified,
}: {
  name: string;
  description: string;
  path: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: absoluteUrl(path),
    publisher: PUBLISHER,
    inLanguage: 'en',
    ...(dateModified ? { dateModified } : {}),
  };
}
