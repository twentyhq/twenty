import type { MetadataRoute } from 'next';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { PUBLIC_APP_LOCALE_LIST, localeToUrlSegment } from '@/lib/i18n';
import { getSiteUrl } from '@/lib/seo';
import { getIndexedWebsiteRoutes } from '@/lib/website-routing';

const SITE_URL = getSiteUrl();

const buildLocalizedUrl = (locale: AppLocale, path: string): string => {
  const prefix =
    locale === SOURCE_LOCALE ? '' : `/${localeToUrlSegment(locale)}`;
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
  return getIndexedWebsiteRoutes().flatMap(
    ({ path, changeFrequency, priority }) =>
      localize(path, changeFrequency, priority),
  );
}
