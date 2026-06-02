import type {
  MarketplacePartner,
  PartnerScope,
  ServedGeo,
  SpokenLanguage,
} from '@/lib/partners-api';

export type FilterCriteria = {
  regions: ReadonlySet<ServedGeo>;
  languages: ReadonlySet<SpokenLanguage>;
  categories: ReadonlySet<PartnerScope>;
};

export const EMPTY_CRITERIA: FilterCriteria = {
  regions: new Set(),
  languages: new Set(),
  categories: new Set(),
};

const facetMatches = <T>(
  values: readonly T[],
  selected: ReadonlySet<T>,
): boolean => selected.size === 0 || values.some((v) => selected.has(v));

export const filterPartners = (
  partners: readonly MarketplacePartner[],
  criteria: FilterCriteria,
): readonly MarketplacePartner[] =>
  partners.filter(
    (p) =>
      facetMatches(p.region, criteria.regions) &&
      facetMatches(p.languagesSpoken, criteria.languages) &&
      facetMatches(p.partnerScope, criteria.categories),
  );

export const hasAnyFilter = (criteria: FilterCriteria): boolean =>
  criteria.regions.size > 0 ||
  criteria.languages.size > 0 ||
  criteria.categories.size > 0;
