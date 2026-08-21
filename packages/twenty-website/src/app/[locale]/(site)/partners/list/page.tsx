import { Suspense } from 'react';

import { msg } from '@lingui/core/macro';

import {
  ClientBriefModalRoot,
  ClientBriefTextLink,
  SubmitBriefButton,
} from '@/client-brief';
import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { getMarketplacePartners } from '@/partners-marketplace/marketplace-partners-source';
import { MarketplaceClient } from '@/partners-marketplace/MarketplaceClient';
import { MarketplaceListSkeleton } from '@/partners-marketplace/MarketplaceListSkeleton';
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
    getMarketplacePartners(),
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
      <ClientBriefModalRoot>
        <main>
          <MarketplaceHeader
            briefLink={
              <ClientBriefTextLink>tell us what you need</ClientBriefTextLink>
            }
          />
          <Suspense fallback={<MarketplaceListSkeleton />}>
            <MarketplaceClient
              briefAction={
                <SubmitBriefButton label={msg`Get matched`} variant="filled" />
              }
              briefPromptAction={
                <SubmitBriefButton label={msg`Submit a brief`} />
              }
              partners={partners}
            />
          </Suspense>
        </main>
      </ClientBriefModalRoot>
    </>
  );
}
