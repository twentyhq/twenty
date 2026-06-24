import { Suspense } from 'react';

import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { fetchLiveMarketplacePartners } from '@/partners-marketplace/fetch-live-marketplace-partners';
import { MarketplaceClient } from '@/partners-marketplace/MarketplaceClient';
import { MarketplaceHeader } from '@/partners-marketplace/MarketplaceHeader';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/platform/seo';
import { Menu } from '@/sections/menu';

export const generateMetadata = buildRouteMetadata('partnersList');

export const dynamic = 'force-dynamic';

export default async function PartnersMarketplacePage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats, partners] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
    fetchLiveMarketplacePartners(),
  ]);
  const locale = resolveLocaleParam((await params).locale);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
            { name: 'Marketplace', path: '/partners/list' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} scheme="light" />
      <main>
        <MarketplaceHeader />
        <Suspense fallback={null}>
          <MarketplaceClient partners={partners} />
        </Suspense>
      </main>
    </>
  );
}
