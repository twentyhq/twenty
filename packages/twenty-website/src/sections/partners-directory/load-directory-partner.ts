import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { getMarketplacePartnerBySlug } from '@/partners-marketplace/marketplace-partners-source';

import { LOCAL_SAMPLE_PARTNERS } from './local-sample-partners.data';

// Same local stand-in as load-directory-partners.
export const loadDirectoryPartner = async (
  slug: string,
): Promise<MarketplacePartner | undefined> =>
  (await getMarketplacePartnerBySlug(slug)) ??
  (process.env.NODE_ENV !== 'production'
    ? LOCAL_SAMPLE_PARTNERS.find((sample) => sample.slug === slug)
    : undefined);
