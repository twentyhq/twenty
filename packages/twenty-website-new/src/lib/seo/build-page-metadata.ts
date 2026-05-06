import type { Metadata } from 'next';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import {
  PUBLIC_APP_LOCALE_LIST,
  isPublicAppLocale,
} from '@/lib/i18n/app-locale-set';
import { createI18nInstance } from '@/lib/i18n/create-i18n-instance';
import { createMessageDescriptorRenderer } from '@/lib/i18n/create-message-descriptor-renderer';
import { localeToUrlSegment } from '@/lib/i18n/website-locale-segments';
import type { MessageDescriptor } from '@lingui/core';

import { getSiteUrl } from './site-url';

const SITE_NAME = 'Twenty';
const TWITTER_HANDLE = '@twentycrm';

export type BuildPageMetadataInput = {
  locale: AppLocale;
  path: string;
  title: MessageDescriptor;
  description: MessageDescriptor;
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
): Record<string, string> => {
  const languages: Record<string, string> = {};
  for (const locale of PUBLIC_APP_LOCALE_LIST) {
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
  ogImage,
  type = 'website',
  extend,
}: BuildPageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const normalizedPath = normalizePath(path);
  const metadataLocale = isPublicAppLocale(locale) ? locale : SOURCE_LOCALE;
  const canonical = localizePath(metadataLocale, normalizedPath);
  const i18n = createI18nInstance(metadataLocale);
  const renderText = createMessageDescriptorRenderer(i18n);
  const resolvedTitle = renderText(title);
  const resolvedDescription = renderText(description);

  const ogImages =
    ogImage === undefined
      ? undefined
      : [
          {
            url: /^https?:\/\//i.test(ogImage)
              ? ogImage
              : `${siteUrl}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`,
          },
        ];

  const baseMetadata: Metadata = {
    title: { absolute: resolvedTitle },
    description: resolvedDescription,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(normalizedPath),
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: metadataLocale,
      type,
      ...(ogImages && { images: ogImages }),
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      ...(ogImages && { images: ogImages.map((image) => image.url) }),
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
