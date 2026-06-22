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

// Render at request time, never at build. The partner list comes from a live API;
// a build-time fetch failure used to bake an empty marketplace into the static
// page and freeze it in the OpenNext/R2 cache. Rendering dynamically fetches at
// runtime where the API is reachable; the /s/partners fetch keeps its
// next:{revalidate:300} cache, so responses stay cached and serve stale on blips.
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
