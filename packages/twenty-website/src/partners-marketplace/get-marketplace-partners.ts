import { DUMMY_PARTNERS } from './dummy-marketplace-partners';
import { fetchLiveMarketplacePartners } from './fetch-live-marketplace-partners';
import { type MarketplacePartner } from './marketplace-partner';
import { rankPartners } from './rank-partners';

const useDummy = process.env.NEXT_PUBLIC_USE_DUMMY_PARTNERS === '1';

export const getMarketplacePartners = async (): Promise<
  MarketplacePartner[]
> => {
  const partners = useDummy
    ? DUMMY_PARTNERS
    : await fetchLiveMarketplacePartners();
  return rankPartners(partners);
};
