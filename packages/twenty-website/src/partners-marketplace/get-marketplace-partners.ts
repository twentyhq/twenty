import { fetchLiveMarketplacePartners } from './fetch-live-marketplace-partners';
import { type MarketplacePartner } from './marketplace-partner';
import { rankPartners } from './rank-partners';

// The ranked list crosses a client boundary, so React serializes whatever it
// carries into the page source. The ranking fields are inputs to the order, not
// page content: partnerTier is an internal classification the UI never renders,
// and rotationKey is next week's tiebreak seed. Neither belongs in View Source
// of a page that exists to stop partners from gaming their position.
export const getMarketplacePartners = async (): Promise<
  MarketplacePartner[]
> => {
  const partners = await fetchLiveMarketplacePartners();

  return rankPartners(partners).map(
    ({
      partnerTier: _partnerTier,
      serviceCount: _serviceCount,
      approvedCaseStudyCount: _approvedCaseStudyCount,
      approvedCaseStudyWithCoverCount: _approvedCaseStudyWithCoverCount,
      rotationKey: _rotationKey,
      ...partner
    }) => partner,
  );
};
