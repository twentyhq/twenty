import { DUMMY_PARTNERS } from './dummy-marketplace-partners';
import { fetchLivePartnerProfile } from './fetch-live-partner-profile';
import { type MarketplacePartner } from './marketplace-partner';

const useDummy = process.env.NEXT_PUBLIC_USE_DUMMY_PARTNERS === '1';

export const getMarketplacePartnerBySlug = async (
  slug: string,
): Promise<MarketplacePartner | undefined> => {
  if (useDummy) {
    return DUMMY_PARTNERS.find((partner) => partner.slug === slug);
  }

  return fetchLivePartnerProfile(slug);
};
