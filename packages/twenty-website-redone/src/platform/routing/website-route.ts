import { type MessageDescriptor } from '@lingui/core';
import { type MetadataRoute } from 'next';

export type WebsiteRouteId = 'home';

// The route registry entry: sitemap, robots, hreflang, and per-page metadata
// all derive from these records, so a page's SEO surface lives in one place.
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
