import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/seo';

const SITE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/halftone',
          '/*/halftone',
          '/enterprise/activate',
          '/*/enterprise/activate',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
