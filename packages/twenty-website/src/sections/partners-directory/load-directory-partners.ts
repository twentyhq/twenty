import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { getMarketplacePartners } from '@/partners-marketplace/marketplace-partners-source';

import { LOCAL_SAMPLE_PARTNERS } from './local-sample-partners.data';

// Local runs have no partners API key; never used in production.
export const loadDirectoryPartners = async (): Promise<
  readonly MarketplacePartner[]
> => {
  const partners = await getMarketplacePartners();

  return partners.length === 0 && process.env.NODE_ENV !== 'production'
    ? LOCAL_SAMPLE_PARTNERS
    : partners;
};
