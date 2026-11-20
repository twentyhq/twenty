import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { getMarketplacePartners } from '@/partners-marketplace/marketplace-partners-source';

import { PROTOTYPE_SAMPLE_PARTNERS } from './prototype-sample-partners.data';

// Local runs have no partners API key: the directory would be empty, so they
// show the partners published on twenty.com instead. Never in production.
export const loadDirectoryPartners = async (): Promise<
  readonly MarketplacePartner[]
> => {
  const partners = await getMarketplacePartners();

  return partners.length === 0 && process.env.NODE_ENV !== 'production'
    ? PROTOTYPE_SAMPLE_PARTNERS
    : partners;
};
