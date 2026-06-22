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
const DEFAULT_OG_IMAGE_PATH = '/images/og/default.png';

// Static pages pass catalog messages; dynamic family entries pass plain
// strings from their content source.
type MetadataText = MessageDescriptor | string;

export type BuildPageMetadataInput = {
  description: MetadataText;
  indexed?: boolean;
  locale: AppLocale;
  locales?: readonly AppLocale[];
  ogImagePath?: string;
  path: string;
  title: MetadataText;
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
  indexed = true,
  locale,
  locales = WEBSITE_LOCALE_LIST,
  ogImagePath = DEFAULT_OG_IMAGE_PATH,
  path,
  title,
}: BuildPageMetadataInput): Metadata {
  const metadataLocale = isWebsiteLocale(locale) ? locale : SOURCE_LOCALE;
  const canonical = localizePath(metadataLocale, path);
  const i18n = createI18nInstance(metadataLocale);
  const resolvedTitle = typeof title === 'string' ? title : i18n._(title);
  const resolvedDescription =
    typeof description === 'string' ? description : i18n._(description);
  const ogImages = [{ url: ogImagePath }];

  return {
    metadataBase: new URL(getSiteUrl()),
    title: { absolute: resolvedTitle },
    description: resolvedDescription,
    robots: { index: indexed, follow: true },
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
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: ogImages.map((image) => image.url),
    },
  };
}
