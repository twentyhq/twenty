import type { MetadataRoute } from 'next';

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
  { path: '/customers/9dots', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/customers/act-education', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/customers/alternative-partners', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/customers/elevate-consulting', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/customers/netzero', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/customers/w3villa', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
