import type { MetadataRoute } from 'next';
import { BRAND, TAGLINE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND,
    short_name: BRAND,
    description: 'Privacy-first image tools that run entirely in your browser.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08090d',
    theme_color: '#08090d',
    icons: [
      {
        src: '/icon-192.png?v=5',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png?v=5',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.svg?v=5',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
