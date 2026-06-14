import { type MessageDescriptor } from '@lingui/core';
import { type MetadataRoute } from 'next';

export type WebsiteRouteId =
  | 'customers'
  | 'home'
  | 'partners'
  | 'partnersApply'
  | 'partnersList'
  | 'pricing'
  | 'product'
  | 'releases'
  | 'whyTwenty';

// Grows as content-driven families migrate ('articles', 'releases', ...).
export type WebsiteRouteFamilyId = never;

export type SitemapChangeFrequency =
  MetadataRoute.Sitemap[number]['changeFrequency'];

// A static page. Sitemap, robots, hreflang, and metadata derive from this
// record, so a page's SEO surface lives in one place.
export type WebsiteRoute = {
  changeFrequency: SitemapChangeFrequency;
  description: MessageDescriptor;
  id: WebsiteRouteId;
  indexed: boolean;
  localeMode?: 'all' | 'source';
  ogImagePath?: string;
  path: string;
  priority: number;
  robotsDisallow?: boolean;
  title: MessageDescriptor;
};

// One slug under a dynamic family, produced by the family's enumerator from
// its content source (markdown, CMS). Strings are content, not catalog
// messages — they arrive already written per entry.
export type WebsiteRouteFamilyEntry = {
  description: string;
  lastModified?: Date;
  ogImagePath?: string;
  slug: string;
  title: string;
};

// A dynamic route family (e.g. /articles/[slug]). The enumerator is the
// single source for generateStaticParams, the sitemap, and per-entry
// metadata.
export type WebsiteRouteFamily = {
  basePath: string;
  changeFrequency: SitemapChangeFrequency;
  enumerateEntries: () => Promise<readonly WebsiteRouteFamilyEntry[]>;
  id: WebsiteRouteFamilyId;
  indexed: boolean;
  localeMode?: 'all' | 'source';
  priority: number;
};
