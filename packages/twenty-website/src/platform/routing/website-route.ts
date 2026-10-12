import { type MessageDescriptor } from '@lingui/core';
import { type MetadataRoute } from 'next';

export type WebsiteRouteId =
  | 'apps'
  | 'comparePricingDynamics'
  | 'comparePricingHubspot'
  | 'comparePricingPipedrive'
  | 'comparePricingSalesforce'
  | 'comparePricingSap'
  | 'customers'
  | 'enterpriseActivate'
  | 'halftone'
  | 'home'
  | 'partners'
  | 'partnersApply'
  | 'partnersBecome'
  | 'partnersBrief'
  | 'pricing'
  | 'privacyPolicy'
  | 'product'
  | 'releases'
  | 'support'
  | 'terms'
  | 'whyTwenty';

// Grows as content-driven families migrate ('articles', 'releases', ...).
export type WebsiteRouteFamilyId = never;

export type SitemapChangeFrequency =
  MetadataRoute.Sitemap[number]['changeFrequency'];

// Sitemap, robots, hreflang and metadata all derive from this record.
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

// Strings are content, not catalog messages: they arrive already written per entry.
export type WebsiteRouteFamilyEntry = {
  description: string;
  lastModified?: Date;
  ogImagePath?: string;
  slug: string;
  title: string;
};

// The enumerator feeds generateStaticParams, the sitemap and per-entry metadata.
export type WebsiteRouteFamily = {
  basePath: string;
  changeFrequency: SitemapChangeFrequency;
  enumerateEntries: () => Promise<readonly WebsiteRouteFamilyEntry[]>;
  id: WebsiteRouteFamilyId;
  indexed: boolean;
  localeMode?: 'all' | 'source';
  priority: number;
};
