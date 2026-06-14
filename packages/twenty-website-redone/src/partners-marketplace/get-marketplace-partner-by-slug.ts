import { loadMarketplacePartners } from './load-marketplace-partners';
import { type MarketplacePartner } from './marketplace-partner';

// The profile page's single read: resolve a partner by slug off the same data
// seam the list uses (the dev fixture today, the live list once wired). Returns
// null for an unknown slug so the page renders notFound().
export async function getMarketplacePartnerBySlug(
  slug: string,
): Promise<MarketplacePartner | null> {
  const partners = await loadMarketplacePartners();
  return partners.find((partner) => partner.slug === slug) ?? null;
}
