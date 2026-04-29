import { WEBSITE_ROUTES, type WebsiteRouteId } from '@/lib/website-routing';

import { buildLocalizedMetadata } from './build-localized-metadata';
import type { BuildPageMetadataInput } from './build-page-metadata';

type BuildRouteMetadataOptions = Partial<
  Omit<BuildPageMetadataInput, 'locale' | 'path' | 'title' | 'description'>
>;

export const buildRouteMetadata = (
  routeId: WebsiteRouteId,
  options?: BuildRouteMetadataOptions,
) => {
  const route = WEBSITE_ROUTES[routeId];

  if (route === undefined) {
    throw new Error(`Unknown website route: ${routeId}`);
  }

  return buildLocalizedMetadata({
    path: route.path,
    title: route.title,
    description: route.description,
    ...options,
  });
};
