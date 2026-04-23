import type { Metadata } from 'next';

import { getSiteUrl } from './site-url';

const SITE_NAME = 'Twenty';
const TWITTER_HANDLE = '@twentycrm';

export type BuildPageMetadataInput = {
  /** Route path beginning with `/`. Used for canonical + OG URL. */
  path: string;
  title: string;
  description: string;
  /** Optional OG image (absolute or root-relative). Omitted if not provided. */
  ogImage?: string;
  /** OG type — defaults to `website`. */
  type?: 'website' | 'article';
  /** Optional Next.js `Metadata` extension merged on top. */
  extend?: Metadata;
};

/**
 * Builds a `Metadata` object that's correct by default — absolute canonical,
 * OG, and Twitter card — without requiring every page to repeat the same
 * boilerplate.
 *
 * Pages may extend the result via `extend` for page-specific overrides
 * (e.g. structured data, `alternates.languages`).
 */
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

  return { ...baseMetadata, ...extend };
}
