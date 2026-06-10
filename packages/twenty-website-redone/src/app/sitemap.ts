import { type MetadataRoute } from 'next';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { localeToUrlSegment } from '@/platform/i18n/locale-to-url-segment';
import { WEBSITE_LOCALE_LIST } from '@/platform/i18n/website-locale-list';
import { getIndexedWebsiteRoutes } from '@/platform/routing';
import { getSiteUrl } from '@/platform/seo';

const SITE_URL = getSiteUrl();

const buildLocalizedUrl = (locale: AppLocale, path: string): string => {
  const prefix =
    locale === SOURCE_LOCALE ? '' : `/${localeToUrlSegment(locale)}`;
  const tail = path === '/' ? '' : path;
  return `${SITE_URL}${prefix}${tail}`;
};

const buildLanguageAlternates = (
  path: string,
  locales: readonly AppLocale[],
): Record<string, string> => {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = buildLocalizedUrl(locale, path);
  }
  alternates['x-default'] = buildLocalizedUrl(SOURCE_LOCALE, path);
  return alternates;
};

export default function sitemap(): MetadataRoute.Sitemap {
  return getIndexedWebsiteRoutes().flatMap((route) => {
    const locales: readonly AppLocale[] =
      route.localeMode === 'source' ? [SOURCE_LOCALE] : WEBSITE_LOCALE_LIST;

    return locales.map((locale) => ({
      url: buildLocalizedUrl(locale, route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: buildLanguageAlternates(route.path, locales) },
    }));
  });
}
