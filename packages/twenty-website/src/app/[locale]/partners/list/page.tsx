import { Suspense } from 'react';

import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';
import { getPartners } from '@/lib/partners-api/get-partners';

import { MarketplaceHeader } from './components';
import { MarketplaceClient } from './MarketplaceClient';

export const generateMetadata = buildRouteMetadata('partnersList');

type PartnersMarketplacePageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function PartnersMarketplacePage({
  params,
}: PartnersMarketplacePageProps) {
  const [, stats, livePartners] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
    getPartners(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu
        backgroundColor={theme.colors.primary.background[100]}
        socialLinks={menuSocialLinks}
      />

      <MarketplaceHeader />

      <Suspense fallback={null}>
        <MarketplaceClient partners={livePartners} />
      </Suspense>
    </>
  );
}
