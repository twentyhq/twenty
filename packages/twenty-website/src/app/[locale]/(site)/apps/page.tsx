import {
  AppsMarketplaceClient,
  AppsMarketplaceHeader,
  fetchMarketplaceApps,
} from '@/apps-marketplace';
import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/platform/seo';
import { Menu } from '@/sections/menu';

export const generateMetadata = buildRouteMetadata('apps');

export const dynamic = 'force-dynamic';

export default async function AppsMarketplacePage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats, apps] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
    fetchMarketplaceApps(),
  ]);
  const locale = resolveLocaleParam((await params).locale);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Apps', path: '/apps' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} scheme="light" />
      <main>
        <AppsMarketplaceHeader />
        <AppsMarketplaceClient apps={apps} />
      </main>
    </>
  );
}
