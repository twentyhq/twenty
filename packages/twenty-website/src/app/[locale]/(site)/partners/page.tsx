import { Suspense } from 'react';

import { ClientBriefModalRoot } from '@/client-brief';
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
import { PartnerFaq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { PartnerLeadHero } from '@/sections/partner-hero';
import {
  PartnerBecomeStrip,
  PartnerDirectory,
  PartnerDirectoryPanel,
  PartnerServicesExplainer,
} from '@/sections/partner-lead';

export const generateMetadata = buildRouteMetadata('partners');

export const dynamic = 'force-dynamic';

// Kept out of the page-level await: the rest of the page must not wait on a
// call only the directory needs, and awaiting it there also resolves it before
// the boundary renders, leaving MarketplaceListSkeleton dead.
async function PartnerDirectoryZone() {
  const partners = await getMarketplacePartners();

  return <PartnerDirectoryPanel partners={partners} />;
}

export default async function PartnersPage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const locale = resolveLocaleParam((await params).locale);

  return (
    <PartnerApplicationModalRoot>
      <ClientBriefModalRoot>
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
          <PartnerDirectory>
            <Suspense fallback={<MarketplaceListSkeleton />}>
              <PartnerDirectoryZone />
            </Suspense>
          </PartnerDirectory>
          <PartnerServicesExplainer />
          <MarketplaceBriefPrompt />
          <PartnerFaq />
          <PartnerBecomeStrip />
        </main>
      </ClientBriefModalRoot>
    </PartnerApplicationModalRoot>
  );
}
