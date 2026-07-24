import { type MessageDescriptor } from '@lingui/core';
import { type MetadataRoute } from 'next';

export type WebsiteRouteId =
  | 'apps'
  | 'customers'
  | 'enterpriseActivate'
  | 'halftone'
  | 'home'
  | 'partners'
  | 'partnersApply'
  | 'partnersBrief'
  | 'partnersList'
  | 'pricing'
  | 'privacyPolicy'
  | 'product'
  | 'releases'
  | 'terms'
  | 'whyTwenty';

// Grows as content-driven families migrate ('articles', 'releases', ...).
export type WebsiteRouteFamilyId = 'customerStories' | 'partnerProfiles';

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
// its content source (markdown, CMS, live API). Strings are content, not
// catalog messages — the enumerator resolves any catalog messages to strings
// before returning them.
export type WebsiteRouteFamilyEntry = {
  description: string;
  lastModified?: Date;
  ogImagePath?: string;
  slug: string;
  title: string;
};

// A dynamic route family (e.g. /articles/[slug]). The enumerator feeds the
// sitemap today, and is shaped to also drive generateStaticParams and
// per-entry metadata as pages migrate onto it.
export type WebsiteRouteFamily = {
  basePath: string;
  changeFrequency: SitemapChangeFrequency;
  enumerateEntries: () => Promise<readonly WebsiteRouteFamilyEntry[]>;
  id: WebsiteRouteFamilyId;
  indexed: boolean;
  localeMode?: 'all' | 'source';
  priority: number;
};
