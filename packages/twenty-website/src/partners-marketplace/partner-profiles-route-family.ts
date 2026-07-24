import { type WebsiteRouteFamily } from '@/platform/routing/website-route';

import { fetchLiveMarketplacePartners } from './fetch-live-marketplace-partners';

export const PARTNER_PROFILES_ROUTE_FAMILY: WebsiteRouteFamily = {
  id: 'partnerProfiles',
  basePath: '/partners/profile',
  changeFrequency: 'weekly',
  priority: 0.5,
  indexed: true,
  enumerateEntries: async () => {
    const partners = await fetchLiveMarketplacePartners();
    return partners.map((partner) => ({
      slug: partner.slug,
      title: partner.name,
      description: partner.introduction,
    }));
  },
};
