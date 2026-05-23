// Facet vocabularies are the single source of truth for partner filtering:
// the `as const` arrays drive both the runtime filter options and the union
// types derived from them, so the two can never drift out of sync.

export const SERVED_GEOS = [
  'EUROPE',
  'US',
  'LATAM',
  'MENA',
  'APAC',
  'AFRICA',
] as const;
export type ServedGeo = (typeof SERVED_GEOS)[number];

export const SPOKEN_LANGUAGES = [
  'ENGLISH',
  'FRENCH',
  'GERMAN',
  'CHINESE',
  'SPANISH',
] as const;
export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number];

export const DEPLOYMENT_EXPERTISES = ['CLOUD', 'SELF_HOST'] as const;
export type DeploymentExpertise = (typeof DEPLOYMENT_EXPERTISES)[number];
