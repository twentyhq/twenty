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

// Mirrors the MULTI_SELECT options on the Partner.languagesSpoken field in the
// twenty-partners SDK app. Keep these in sync — the CRM is the source of truth
// and any value it can store should appear here. Unknown values still render
// via PartnerChipRow's title-case fallback so a forgotten sync only loses the
// translated label, not the chip itself.
export const SPOKEN_LANGUAGES = [
  'ENGLISH',
  'FRENCH',
  'GERMAN',
  'CHINESE',
  'SPANISH',
  'ARABIC',
  'BENGALI',
  'CATALAN',
  'CZECH',
  'DANISH',
  'DUTCH',
  'FARSI',
  'FINNISH',
  'GREEK',
  'HINDI',
  'INDONESIAN',
  'ITALIAN',
  'JAPANESE',
  'KOREAN',
  'MALAY',
  'NORWEGIAN',
  'POLISH',
  'PORTUGUESE',
  'PUNJABI',
  'ROMANIAN',
  'RUSSIAN',
  'SWAHILI',
  'SWEDISH',
  'TAGALOG',
  'TAMIL',
  'THAI',
  'TURKISH',
  'UKRAINIAN',
  'URDU',
  'VIETNAMESE',
] as const;
export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number];

// Mirrors the MULTI_SELECT options on the Partner.partnerScope field (labelled
// "Categories" in the CRM) in the twenty-partners SDK app. These are the macro
// categories a partner operates in. Keep in sync with the app's partner.object
// options — the CRM is the source of truth. Unknown values still render via
// PartnerChipRow's title-case fallback.
export const PARTNER_SCOPES = [
  'ADVISORY',
  'SOLUTIONING',
  'DEVELOPMENT',
  'HOSTING',
  'SUPPORT',
] as const;
export type PartnerScope = (typeof PARTNER_SCOPES)[number];
