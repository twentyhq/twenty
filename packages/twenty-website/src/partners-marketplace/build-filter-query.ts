import { type FilterCriteria } from './filter-criteria';

// Sorted + comma-joined so the same selection always yields the same URL
// (stable, shareable, cache-friendly).
const encodeFacet = (values: ReadonlySet<string>): string | null =>
  values.size === 0 ? null : Array.from(values).toSorted().join(',');

export const buildFilterQuery = (criteria: FilterCriteria): string => {
  const params = new URLSearchParams();
  const regions = encodeFacet(criteria.regions);
  const languages = encodeFacet(criteria.languages);
  const categories = encodeFacet(criteria.categories);
  if (regions !== null) params.set('regions', regions);
  if (languages !== null) params.set('languages', languages);
  if (categories !== null) params.set('categories', categories);
  return params.toString();
};
