import type { MetadataRoute } from 'next';

import type { MessageDescriptor } from '@lingui/core';

export type WebsiteRouteId =
  | 'home'
  | 'whyTwenty'
  | 'product'
  | 'pricing'
  | 'partners'
  | 'releases'
  | 'customers'
  | 'articles'
  | 'privacyPolicy'
  | 'terms'
  | 'halftone'
  | 'enterpriseActivate'
  | `articles:${string}`
  | `customer:${string}`;

export type WebsiteRoute = {
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  description: MessageDescriptor;
  id: WebsiteRouteId;
  indexed: boolean;
  localeMode?: 'all' | 'source';
  path: string;
  priority: number;
  robotsDisallow?: boolean;
  title: MessageDescriptor;
};
