import { type FilterCriteria } from './filter-criteria';

export const hasAnyFilter = (criteria: FilterCriteria): boolean =>
  criteria.regions.size > 0 ||
  criteria.languages.size > 0 ||
  criteria.categories.size > 0;
