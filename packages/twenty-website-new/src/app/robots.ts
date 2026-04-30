import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/seo';
import { getRobotsDisallowedRoutePaths } from '@/lib/website-routing';

const SITE_URL = getSiteUrl();
const ALWAYS_DISALLOW = ['/api/'] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...ALWAYS_DISALLOW, ...getRobotsDisallowedRoutePaths()],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
