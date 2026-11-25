import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { getMarketplacePartners } from '@/partners-marketplace/marketplace-partners-source';

import { isPartnersApiConfigured } from './is-partners-api-configured';
import { PARTNERS_SNAPSHOT } from './partners-snapshot.data';

// The API's partners; the snapshot of the live ones where the API is not
// configured (local runs, previews).
export const loadDirectoryPartners = async (): Promise<
  readonly MarketplacePartner[]
> =>
  isPartnersApiConfigured()
    ? await getMarketplacePartners()
    : PARTNERS_SNAPSHOT;
