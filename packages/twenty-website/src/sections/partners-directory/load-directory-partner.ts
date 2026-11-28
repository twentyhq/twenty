import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { getMarketplacePartnerBySlug } from '@/partners-marketplace/marketplace-partners-source';

import { isPartnersApiConfigured } from './is-partners-api-configured';
import { PARTNERS_SNAPSHOT } from './partners-snapshot.data';

// Same source as load-directory-partners.
export const loadDirectoryPartner = async (
  slug: string,
): Promise<MarketplacePartner | undefined> =>
  isPartnersApiConfigured()
    ? await getMarketplacePartnerBySlug(slug)
    : PARTNERS_SNAPSHOT.find((partner) => partner.slug === slug);
