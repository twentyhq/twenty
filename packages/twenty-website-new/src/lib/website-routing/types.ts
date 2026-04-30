import type { MetadataRoute } from 'next';

import type { LocalizableText } from '@/lib/i18n/localizable-text';

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
  description: LocalizableText;
  id: WebsiteRouteId;
  indexed: boolean;
  path: string;
  priority: number;
  robotsDisallow?: boolean;
  title: LocalizableText;
};
