import { fetchLiveMarketplacePartners } from './fetch-live-marketplace-partners';
import { MARKETPLACE_PARTNERS_FIXTURE } from './marketplace-partners-fixture';
import { type MarketplacePartner } from './marketplace-partner';

// The single data seam the page reads. With the partners API configured the
// live fetch runs (degrading to [] on error); without it — local dev until the
// backend is wired — the dev fixture stands in so the marketplace previews
// populated.
//
// To go live: set TWENTY_PARTNERS_API_URL / _API_KEY (no code change).
// To drop the sample data: delete marketplace-partners-fixture.ts and this
// no-env branch — the no-env path then returns [] (the empty state).
export async function loadMarketplacePartners(): Promise<
  readonly MarketplacePartner[]
> {
  if (process.env.TWENTY_PARTNERS_API_URL === undefined) {
    return MARKETPLACE_PARTNERS_FIXTURE;
  }
  return fetchLiveMarketplacePartners();
}
