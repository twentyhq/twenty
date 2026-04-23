import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/seo';

const SITE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Internal / utility surfaces that shouldn't be indexed. The
        // halftone studio is a tool page; enterprise activation is reached
        // by signed link only; api routes serve JSON.
        disallow: ['/halftone', '/enterprise/activate', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
