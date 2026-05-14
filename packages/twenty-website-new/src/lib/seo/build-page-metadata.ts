import type { Metadata } from 'next';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import {
  PUBLIC_APP_LOCALE_LIST,
  isPublicAppLocale,
} from '@/lib/i18n/utils/app-locale-set';
import { createI18nInstance } from '@/lib/i18n/utils/create-i18n-instance';
import { localeToUrlSegment } from '@/lib/i18n/utils/website-locale-segments';
import type { MessageDescriptor } from '@lingui/core';

import { getSiteUrl } from './site-url';

const SITE_NAME = 'Twenty';
const TWITTER_HANDLE = '@twentycrm';
const DEFAULT_OG_IMAGE_PATH = '/images/og/default.png';

export type BuildPageMetadataInput = {
  locale: AppLocale;
  path: string;
  title: MessageDescriptor;
  description: MessageDescriptor;
  locales?: readonly AppLocale[];
  ogImage?: string;
  type?: 'website' | 'article';
  extend?: Metadata;
};

const normalizePath = (path: string): string =>
  path.startsWith('/') ? path : `/${path}`;

const localizePath = (locale: AppLocale, normalizedPath: string): string => {
  if (locale === SOURCE_LOCALE || !isPublicAppLocale(locale)) {
    return normalizedPath;
  }
  const segment = localeToUrlSegment(locale);
  return normalizedPath === '/'
    ? `/${segment}`
    : `/${segment}${normalizedPath}`;
};

const buildLanguageAlternates = (
  normalizedPath: string,
  locales: readonly AppLocale[],
): Record<string, string> => {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = localizePath(locale, normalizedPath);
  }
  languages['x-default'] = localizePath(SOURCE_LOCALE, normalizedPath);
  return languages;
};

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  locales = PUBLIC_APP_LOCALE_LIST,
  ogImage,
  type = 'website',
  extend,
}: BuildPageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const normalizedPath = normalizePath(path);
  const metadataLocale = isPublicAppLocale(locale) ? locale : SOURCE_LOCALE;
  const canonical = localizePath(metadataLocale, normalizedPath);
  const i18n = createI18nInstance(metadataLocale);
  const resolvedTitle = i18n._(title);
  const resolvedDescription = i18n._(description);

  const resolvedOgImage = ogImage ?? DEFAULT_OG_IMAGE_PATH;
  const ogImages = [
    {
      url: /^https?:\/\//i.test(resolvedOgImage)
        ? resolvedOgImage
        : `${siteUrl}${resolvedOgImage.startsWith('/') ? resolvedOgImage : `/${resolvedOgImage}`}`,
    },
  ];

  const baseMetadata: Metadata = {
    title: { absolute: resolvedTitle },
    description: resolvedDescription,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(normalizedPath, locales),
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: metadataLocale,
      type,
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

  if (!extend) {
    return baseMetadata;
  }

  const {
    openGraph: overrideOpenGraph,
    twitter: overrideTwitter,
    alternates: overrideAlternates,
    ...restOverride
  } = extend;

  const mergedAlternates: Metadata['alternates'] = overrideAlternates
    ? { ...baseMetadata.alternates, ...overrideAlternates }
    : baseMetadata.alternates;

  const mergedOpenGraph: Metadata['openGraph'] = overrideOpenGraph
    ? ({
        ...baseMetadata.openGraph,
        ...overrideOpenGraph,
      } as Metadata['openGraph'])
    : baseMetadata.openGraph;

  const mergedTwitter: Metadata['twitter'] = overrideTwitter
    ? ({
        ...baseMetadata.twitter,
        ...overrideTwitter,
      } as Metadata['twitter'])
    : baseMetadata.twitter;

  return {
    ...baseMetadata,
    ...restOverride,
    alternates: mergedAlternates,
    openGraph: mergedOpenGraph,
    twitter: mergedTwitter,
  };
}
