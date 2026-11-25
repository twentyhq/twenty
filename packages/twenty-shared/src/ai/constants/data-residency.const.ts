export const DATA_RESIDENCIES = [
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

export type DataResidency = (typeof DATA_RESIDENCIES)[number];
