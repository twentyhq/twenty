import {
  DOCUMENTATION_DEFAULT_LANGUAGE,
  type DocumentationSupportedLanguage,
} from 'twenty-shared/constants';

import { getSiteUrl } from './get-site-url';

type BreadcrumbItem = { name: string; path: string };

export const buildBreadcrumbListJsonLd = (
  items: readonly BreadcrumbItem[],
  locale: DocumentationSupportedLanguage,
): Record<string, unknown> => {
  const siteUrl = getSiteUrl();
  const prefix = locale === DOCUMENTATION_DEFAULT_LANGUAGE ? '' : `/${locale}`;

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
