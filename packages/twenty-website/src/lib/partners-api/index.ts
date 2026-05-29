export {
  DEPLOYMENT_EXPERTISES,
  SERVED_GEOS,
  SPOKEN_LANGUAGES,
} from '@/lib/partners-api/partner-facets';
export type {
  DeploymentExpertise,
  ServedGeo,
  SpokenLanguage,
} from '@/lib/partners-api/partner-facets';
export type { MarketplacePartner } from '@/lib/partners-api/partner-types';
export { getPartners } from '@/lib/partners-api/get-partners';
export { getPartnerBySlug } from '@/lib/partners-api/get-partner-by-slug';
