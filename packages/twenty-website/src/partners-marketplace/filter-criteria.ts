import { type PartnerScope } from './partner-scopes';
import { type ServedGeo } from './served-geos';
import { type SpokenLanguage } from './spoken-languages';

// Selected filter facets. Sets (not arrays) so membership tests and toggles are
// O(1); the URL is the source of truth (see parse/build-filter-query).
export type FilterCriteria = {
  regions: ReadonlySet<ServedGeo>;
  languages: ReadonlySet<SpokenLanguage>;
  categories: ReadonlySet<PartnerScope>;
};

export const EMPTY_FILTER_CRITERIA: FilterCriteria = {
  regions: new Set(),
  languages: new Set(),
  categories: new Set(),
};
