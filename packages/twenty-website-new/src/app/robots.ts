import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, '') ?? 'https://twenty.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
