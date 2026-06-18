import { fetchLiveMarketplacePartners } from './fetch-live-marketplace-partners';
import { type MarketplacePartner } from './marketplace-partner';

export async function getMarketplacePartnerBySlug(
  slug: string,
): Promise<MarketplacePartner | null> {
  const partners = await fetchLiveMarketplacePartners();
  return partners.find((partner) => partner.slug === slug) ?? null;
}
