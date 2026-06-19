import { type Metadata } from 'next';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { type LocaleRouteParams } from '@/platform/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { getWebsiteRoute } from '@/platform/routing/get-website-route';
import { type WebsiteRouteId } from '@/platform/routing/website-route';

import { buildPageMetadata } from './build-page-metadata';

// Pages declare `export const generateMetadata = buildRouteMetadata('home')`
// and their entire SEO surface derives from the route registry.
export const buildRouteMetadata = (routeId: WebsiteRouteId) => {
  return async ({
    params,
  }: {
    params: Promise<LocaleRouteParams>;
  }): Promise<Metadata> => {
    const route = getWebsiteRoute(routeId);
    const locale = resolveLocaleParam((await params).locale);

    return buildPageMetadata({
      description: route.description,
      indexed: route.indexed,
      locale,
      locales: route.localeMode === 'source' ? [SOURCE_LOCALE] : undefined,
      ogImagePath: route.ogImagePath,
      path: route.path,
      title: route.title,
    });
  };
};
