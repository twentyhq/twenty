export const APPLICATION_CATEGORIES = [
  'Communication',
  'Productivity',
  'Product management',
  'Sales',
  'Marketing',
  'Enrichment',
  'Data',
  'Search',
  'Other',
] as const;

export type KnownApplicationCategory = (typeof APPLICATION_CATEGORIES)[number];

export type ApplicationCategory = KnownApplicationCategory | (string & {});

export const isKnownApplicationCategory = (
  category: string,
): category is KnownApplicationCategory =>
  (APPLICATION_CATEGORIES as readonly string[]).includes(category);
