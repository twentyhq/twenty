import { Suspense } from 'react';

import type { Metadata } from 'next';

import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/utils/get-route-i18n';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';
import { getPartners } from '@/lib/partners-api';

import { MarketplaceHeader } from './components';
import { MarketplaceClient } from './MarketplaceClient';

const baseGenerateMetadata = buildRouteMetadata('partnersMarketplace');

export const generateMetadata = async (
  ...args: Parameters<typeof baseGenerateMetadata>
): Promise<Metadata> => {
  const base = await baseGenerateMetadata(...args);
  return {
    ...base,
    alternates: {
      ...base.alternates,
      canonical: '/partners-marketplace',
    },
  };
};

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
      <Menu.Root
        backgroundColor={theme.colors.primary.background[100]}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <MarketplaceHeader />

      <Suspense fallback={null}>
        <MarketplaceClient partners={livePartners} />
      </Suspense>
    </>
  );
}
