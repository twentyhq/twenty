import { type MetadataRoute } from 'next';

import { getRobotsDisallowedRoutePaths } from '@/platform/routing';
import { getSiteUrl } from '@/platform/seo';

const ALWAYS_DISALLOW: readonly string[] = ['/api/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...ALWAYS_DISALLOW, ...getRobotsDisallowedRoutePaths()],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
