export type ServedGeo = 'EUROPE' | 'US' | 'LATAM' | 'MENA' | 'APAC' | 'AFRICA';

// The regions a partner serves. Mirrors the Partner.region MULTI_SELECT in the
// twenty-partners CRM (the source of truth); unknown values still render via
// the chip-row title-case fallback, so a missed sync only drops a label.
export const SERVED_GEOS: readonly ServedGeo[] = [
  'EUROPE',
  'US',
  'LATAM',
  'MENA',
  'APAC',
  'AFRICA',
];
