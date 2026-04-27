import type { MetadataRoute } from 'next';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';
import { PUBLIC_APP_LOCALE_LIST } from '@/lib/i18n';
import { getSiteUrl } from '@/lib/seo';

const SITE_URL = getSiteUrl();

type StaticRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

const STATIC_ROUTES: readonly StaticRoute[] = [
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

const buildLocalizedUrl = (locale: AppLocale, path: string): string => {
  const prefix = locale === SOURCE_LOCALE ? '' : `/${locale}`;
  const tail = path === '/' ? '' : path;
  return `${SITE_URL}${prefix}${tail}`;
};

const buildLanguageAlternates = (path: string): Record<string, string> => {
  const alternates: Record<string, string> = {};
  for (const locale of PUBLIC_APP_LOCALE_LIST) {
    alternates[locale] = buildLocalizedUrl(locale, path);
  }
  alternates['x-default'] = buildLocalizedUrl(SOURCE_LOCALE, path);
  return alternates;
};

const localize = (
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
): MetadataRoute.Sitemap =>
  PUBLIC_APP_LOCALE_LIST.map((locale) => ({
    url: buildLocalizedUrl(locale, path),
    changeFrequency,
    priority,
    alternates: { languages: buildLanguageAlternates(path) },
  }));

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.flatMap(
    ({ path, changeFrequency, priority }) =>
      localize(path, changeFrequency, priority),
  );

  const caseStudyEntries = CASE_STUDY_CATALOG_ENTRIES.flatMap((entry) =>
    localize(entry.href, 'yearly', 0.5),
  );

  return [...staticEntries, ...caseStudyEntries];
}
