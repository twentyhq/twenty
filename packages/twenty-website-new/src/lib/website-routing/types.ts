import type { MetadataRoute } from 'next';

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
  description: string;
  id: WebsiteRouteId;
  indexed: boolean;
  path: string;
  priority: number;
  robotsDisallow?: boolean;
  title: string;
};
