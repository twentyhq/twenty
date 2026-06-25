export const DATA_RESIDENCY_KEYS = [
  'us',
  'eu',
  'global',
  'uk',
  'ap',
  'jp',
  'au',
  'ca',
  'de',
  'fr',
] as const;

export type DataResidency = (typeof DATA_RESIDENCY_KEYS)[number];
