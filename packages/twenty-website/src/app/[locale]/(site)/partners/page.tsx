import { Suspense } from 'react';

import { PartnerApplicationModalRoot } from '@/partner-application';
import { MarketplaceBriefPrompt } from '@/partners-marketplace/MarketplaceBriefPrompt';
import { getMarketplacePartners } from '@/partners-marketplace/marketplace-partners-source';
import { MarketplaceListSkeleton } from '@/partners-marketplace/MarketplaceListSkeleton';
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
import { PartnerLeadHero } from '@/sections/partner-hero';
import {
  PartnerDirectory,
  PartnerServicesExplainer,
} from '@/sections/partner-lead';

export const generateMetadata = buildRouteMetadata('partners');

export const dynamic = 'force-dynamic';

export default async function PartnersPage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats, partners] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
    getMarketplacePartners(),
  ]);
  const locale = resolveLocaleParam((await params).locale);

  return (
    <PartnerApplicationModalRoot>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} />
      <main>
        <PartnerLeadHero />
        <Suspense fallback={<MarketplaceListSkeleton />}>
          <PartnerDirectory partners={partners} />
        </Suspense>
        <PartnerServicesExplainer />
        <MarketplaceBriefPrompt />
      </main>
    </PartnerApplicationModalRoot>
  );
}
