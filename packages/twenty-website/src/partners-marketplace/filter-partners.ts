import { type FilterCriteria } from './filter-criteria';
import { type MarketplacePartner } from './marketplace-partner';

// A facet matches when nothing is selected (no constraint) or the partner has
// at least one of the selected values — OR within a facet, AND across facets.
const facetMatches = <FacetValue>(
  values: readonly FacetValue[],
  selected: ReadonlySet<FacetValue>,
): boolean =>
  selected.size === 0 || values.some((value) => selected.has(value));

export const filterPartners = (
  partners: readonly MarketplacePartner[],
  criteria: FilterCriteria,
): readonly MarketplacePartner[] =>
  partners.filter(
    (partner) =>
      facetMatches(partner.region, criteria.regions) &&
      facetMatches(partner.languagesSpoken, criteria.languages) &&
      facetMatches(partner.partnerScope, criteria.categories),
  );
