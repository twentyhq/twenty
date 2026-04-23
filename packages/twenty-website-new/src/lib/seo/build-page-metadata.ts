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
  /** Optional Next.js `Metadata` extension merged on top. See merge rules below. */
  extend?: Metadata;
};

/**
 * Builds a `Metadata` object that's correct by default — absolute canonical,
 * `openGraph`, and `twitter` card — without requiring every page to repeat
 * the boilerplate.
 *
 * ### Merge contract
 *
 * Pages may extend the result via `extend`. The merge rules are:
 *
 * - **Top-level keys** (`title`, `description`, `robots`, `alternates`, …) —
 *   shallow-merged. `extend.title` replaces the default title outright.
 * - **`openGraph`** — *deep-merged* one level. `extend.openGraph.title`
 *   overrides the default OG title without erasing `description`, `url`,
 *   `siteName`, `type`, or `images`. The `images` array, when present in
 *   `extend.openGraph`, replaces the default array entirely (arrays are not
 *   concatenated — pages that need to add to the default image list should
 *   pass the full final array).
 * - **`twitter`** — *deep-merged* one level, same array semantics as above.
 * - **`alternates`** — shallow-merged so a page can add `languages` without
 *   stomping the canonical the helper computed.
 *
 * If you need behaviour outside this contract, build your own `Metadata`
 * object and skip this helper entirely.
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

  const {
    openGraph: overrideOpenGraph,
    twitter: overrideTwitter,
    alternates: overrideAlternates,
    ...restOverride
  } = extend;

  // Each branch normalises `null` to `undefined` so the spread stays type-safe
  // (Next types these fields as `T | null | undefined`).
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
