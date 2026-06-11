import { type MetadataRoute } from 'next';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { localeToUrlSegment } from '@/platform/i18n/locale-to-url-segment';
import { WEBSITE_LOCALE_LIST } from '@/platform/i18n/website-locale-list';
import { getIndexedWebsiteRoutes } from '@/platform/routing';
import { WEBSITE_ROUTE_FAMILY_LIST } from '@/platform/routing/website-route-family-list';
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

const localesFor = (
  localeMode: 'all' | 'source' | undefined,
): readonly AppLocale[] =>
  localeMode === 'source' ? [SOURCE_LOCALE] : WEBSITE_LOCALE_LIST;

const entriesFor = (
  path: string,
  locales: readonly AppLocale[],
  shared: {
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
    lastModified?: Date;
  },
): MetadataRoute.Sitemap =>
  locales.map((locale) => ({
    url: buildLocalizedUrl(locale, path),
    changeFrequency: shared.changeFrequency,
    priority: shared.priority,
    lastModified: shared.lastModified,
    alternates: { languages: buildLanguageAlternates(path, locales) },
  }));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = getIndexedWebsiteRoutes().flatMap((route) =>
    entriesFor(route.path, localesFor(route.localeMode), route),
  );

  const familyEntries = await Promise.all(
    WEBSITE_ROUTE_FAMILY_LIST.filter((family) => family.indexed).map(
      async (family) => {
        const entries = await family.enumerateEntries();
        return entries.flatMap((entry) =>
          entriesFor(
            `${family.basePath}/${entry.slug}`,
            localesFor(family.localeMode),
            {
              changeFrequency: family.changeFrequency,
              priority: family.priority,
              lastModified: entry.lastModified,
            },
          ),
        );
      },
    ),
  );

  return [...staticEntries, ...familyEntries.flat()];
}
