import { type Metadata } from 'next';
import { DOCUMENTATION_DEFAULT_LANGUAGE } from 'twenty-shared/constants';

import { type LocaleRouteParams } from '@/platform/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { getWebsiteRoute } from '@/platform/routing/get-website-route';
import { type WebsiteRouteId } from '@/platform/routing/website-route';

import { buildPageMetadata } from './build-page-metadata';

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
      locales:
        route.localeMode === 'source'
          ? [DOCUMENTATION_DEFAULT_LANGUAGE]
          : undefined,
      ogImagePath: route.ogImagePath,
      path: route.path,
      title: route.title,
    });
  };
};
