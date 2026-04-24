import type { Metadata } from 'next';

import { getSiteUrl } from './site-url';

const SITE_NAME = 'Twenty';
const TWITTER_HANDLE = '@twentycrm';

export type BuildPageMetadataInput = {
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  type?: 'website' | 'article';
  extend?: Metadata;
};

export function buildPageMetadata({
  path,
  title,
  description,
  ogImage,
  type = 'website',
  extend,
}: BuildPageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = path.startsWith('/') ? path : `/${path}`;

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
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type,
      ...(ogImages && { images: ogImages }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
