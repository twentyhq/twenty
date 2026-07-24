import { type MetadataRoute } from 'next';
import {
  DOCUMENTATION_DEFAULT_LANGUAGE,
  type DocumentationSupportedLanguage,
} from 'twenty-shared/constants';

import { WEBSITE_LOCALE_LIST } from '@/platform/i18n/website-locale-list';
import { getIndexedWebsiteRoutes } from '@/platform/routing';
import { WEBSITE_ROUTE_FAMILY_LIST } from '@/platform/routing/website-route-family-list';
import { getSiteUrl } from '@/platform/seo';

const SITE_URL = getSiteUrl();

const buildLocalizedUrl = (
  locale: DocumentationSupportedLanguage,
  path: string,
): string => {
  const prefix = locale === DOCUMENTATION_DEFAULT_LANGUAGE ? '' : `/${locale}`;
  const tail = path === '/' ? '' : path;
  return `${SITE_URL}${prefix}${tail}`;
};

const buildLanguageAlternates = (
  path: string,
  locales: readonly DocumentationSupportedLanguage[],
): Record<string, string> => {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = buildLocalizedUrl(locale, path);
  }
  alternates['x-default'] = buildLocalizedUrl(
    DOCUMENTATION_DEFAULT_LANGUAGE,
    path,
  );
  return alternates;
};

const localesFor = (
  localeMode: 'all' | 'source' | undefined,
): readonly DocumentationSupportedLanguage[] =>
  localeMode === 'source'
    ? [DOCUMENTATION_DEFAULT_LANGUAGE]
    : WEBSITE_LOCALE_LIST;

const entriesFor = (
  path: string,
  locales: readonly DocumentationSupportedLanguage[],
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
        // A single failing enumerator must not sink the whole sitemap (and the
        // build that renders it), so isolate each one here.
        try {
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
        } catch (error) {
          console.error(`[sitemap] route family "${family.id}" failed:`, error);
          return [];
        }
      },
    ),
  );

  return [...staticEntries, ...familyEntries.flat()];
}
