import { type MessageDescriptor } from '@lingui/core';
import { type Metadata } from 'next';
import {
  DOCUMENTATION_DEFAULT_LANGUAGE,
  type DocumentationSupportedLanguage,
} from 'twenty-shared/constants';

import { createI18nInstance } from '@/platform/i18n/create-i18n-instance';
import { WEBSITE_LOCALE_LIST } from '@/platform/i18n/website-locale-list';

import { getSiteUrl } from './get-site-url';

const SITE_NAME = 'Twenty';
const TWITTER_HANDLE = '@twentycrm';
const DEFAULT_OG_IMAGE_PATH = '/images/og/default.png';

type MetadataText = MessageDescriptor | string;

export type BuildPageMetadataInput = {
  description: MetadataText;
  indexed?: boolean;
  locale: DocumentationSupportedLanguage;
  locales?: readonly DocumentationSupportedLanguage[];
  ogImagePath?: string;
  path: string;
  title: MetadataText;
};

const localizePath = (
  locale: DocumentationSupportedLanguage,
  path: string,
): string => {
  if (locale === DOCUMENTATION_DEFAULT_LANGUAGE) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
};

const buildLanguageAlternates = (
  path: string,
  locales: readonly DocumentationSupportedLanguage[],
): Record<string, string> => {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = localizePath(locale, path);
  }
  languages['x-default'] = localizePath(DOCUMENTATION_DEFAULT_LANGUAGE, path);
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
  const canonical = localizePath(locale, path);
  const i18n = createI18nInstance(locale);
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
      locale,
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
