export {
  PARTNER_SCOPES,
  SERVED_GEOS,
  SPOKEN_LANGUAGES,
} from '@/lib/partners-api/partner-facets';
export type {
  PartnerScope,
  ServedGeo,
  SpokenLanguage,
} from '@/lib/partners-api/partner-facets';
export type { MarketplacePartner } from '@/lib/partners-api/partner-types';
export { getPartners } from '@/lib/partners-api/get-partners';
export { getPartnerBySlug } from '@/lib/partners-api/get-partner-by-slug';
