import { fetchLivePartnerProfile } from './fetch-live-partner-profile';
import { type MarketplacePartner } from './marketplace-partner';

export const getMarketplacePartnerBySlug = async (
  slug: string,
): Promise<MarketplacePartner | undefined> => {
  return fetchLivePartnerProfile(slug);
};
