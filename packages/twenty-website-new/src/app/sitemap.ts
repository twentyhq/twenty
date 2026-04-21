import type { MetadataRoute } from 'next';

import { CASE_STUDY_CATALOG_ENTRIES } from '@/app/customers/_constants/case-study-catalog';

const SITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, '') ?? 'https://twenty.com';

const STATIC_ROUTES: ReadonlyArray<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/why-twenty', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/product', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/partners', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/releases', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/customers', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency,
      priority,
    }),
  );

  const caseStudyEntries = CASE_STUDY_CATALOG_ENTRIES.map((entry) => ({
    url: `${SITE_URL}${entry.href}`,
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...caseStudyEntries];
}
