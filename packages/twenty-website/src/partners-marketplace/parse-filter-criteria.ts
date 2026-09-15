import { type FilterCriteria } from './filter-criteria';
import { PARTNER_SCOPES } from './partner-scopes';
import { SERVED_GEOS } from './served-geos';
import { SPOKEN_LANGUAGES } from './spoken-languages';

// Only values in the facet vocabulary survive: a stale or hand-edited URL can't
// inject an unknown facet.
const parseFacet = <FacetValue extends string>(
  raw: string | null,
  allowed: readonly FacetValue[],
): ReadonlySet<FacetValue> => {
  if (raw === null) return new Set();
  const allowedValues = new Set<string>(allowed);
  return new Set(
    raw
      .split(',')
      .map((value) => value.trim())
      .filter((value): value is FacetValue => allowedValues.has(value)),
  );
};

export const parseFilterCriteria = (
  params: URLSearchParams,
): FilterCriteria => ({
  regions: parseFacet(params.get('regions'), SERVED_GEOS),
  languages: parseFacet(params.get('languages'), SPOKEN_LANGUAGES),
  categories: parseFacet(params.get('categories'), PARTNER_SCOPES),
});
