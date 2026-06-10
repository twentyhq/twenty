import { type MessageDescriptor } from '@lingui/core';
import { type Metadata } from 'next';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { createI18nInstance } from '@/platform/i18n/create-i18n-instance';
import { isWebsiteLocale } from '@/platform/i18n/is-website-locale';
import { localeToUrlSegment } from '@/platform/i18n/locale-to-url-segment';
import { WEBSITE_LOCALE_LIST } from '@/platform/i18n/website-locale-list';

import { getSiteUrl } from './get-site-url';

const SITE_NAME = 'Twenty';
const TWITTER_HANDLE = '@twentycrm';

export type BuildPageMetadataInput = {
  description: MessageDescriptor;
  locale: AppLocale;
  locales?: readonly AppLocale[];
  path: string;
  title: MessageDescriptor;
};

const localizePath = (locale: AppLocale, path: string): string => {
  if (locale === SOURCE_LOCALE || !isWebsiteLocale(locale)) return path;
  const segment = localeToUrlSegment(locale);
  return path === '/' ? `/${segment}` : `/${segment}${path}`;
};

const buildLanguageAlternates = (
  path: string,
  locales: readonly AppLocale[],
): Record<string, string> => {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = localizePath(locale, path);
  }
  languages['x-default'] = localizePath(SOURCE_LOCALE, path);
  return languages;
};

export function buildPageMetadata({
  description,
  locale,
  locales = WEBSITE_LOCALE_LIST,
  path,
  title,
}: BuildPageMetadataInput): Metadata {
  const metadataLocale = isWebsiteLocale(locale) ? locale : SOURCE_LOCALE;
  const canonical = localizePath(metadataLocale, path);
  const i18n = createI18nInstance(metadataLocale);
  const resolvedTitle = i18n._(title);
  const resolvedDescription = i18n._(description);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: { absolute: resolvedTitle },
    description: resolvedDescription,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(path, locales),
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: metadataLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
  };
}
