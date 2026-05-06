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
  | 'privacyPolicy'
  | 'terms'
  | 'halftone'
  | 'enterpriseActivate'
  | `customer:${string}`;

export type WebsiteRoute = {
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  description: MessageDescriptor;
  id: WebsiteRouteId;
  indexed: boolean;
  path: string;
  priority: number;
  robotsDisallow?: boolean;
  title: MessageDescriptor;
};
