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
        // by signed link only; api routes serve JSON; the blog route surface
        // returns 404 until launch (see `app/(blog)/blog/page.tsx`).
        disallow: ['/halftone', '/enterprise/activate', '/api/', '/blog'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
