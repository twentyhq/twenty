import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { localeToUrlSegment } from '@/platform/i18n/locale-to-url-segment';

import { getSiteUrl } from './get-site-url';

type BreadcrumbItem = { name: string; path: string };

export const buildBreadcrumbListJsonLd = (
  items: readonly BreadcrumbItem[],
  locale: AppLocale,
): Record<string, unknown> => {
  const siteUrl = getSiteUrl();
  const prefix =
    locale === SOURCE_LOCALE ? '' : `/${localeToUrlSegment(locale)}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${prefix}${item.path}`,
    })),
  };
};
