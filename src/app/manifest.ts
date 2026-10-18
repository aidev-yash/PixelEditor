import type { MetadataRoute } from 'next';
import { BRAND, TAGLINE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND,
    short_name: BRAND,
    description: 'Privacy-first image tools that run entirely in your browser.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f6f7',
    theme_color: '#0b0f15',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
