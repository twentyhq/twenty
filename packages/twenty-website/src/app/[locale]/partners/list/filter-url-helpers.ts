import {
  PARTNER_SCOPES,
  SERVED_GEOS,
  SPOKEN_LANGUAGES,
} from '@/lib/partners-api';

import type { FilterCriteria } from './filter-partners';

const parseFacet = <T extends string>(
  raw: string | null,
  allowed: readonly T[],
): ReadonlySet<T> => {
  if (!raw) return new Set();
  const allowedSet = new Set<string>(allowed);
  const parsed = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is T => allowedSet.has(s));
  return new Set(parsed);
};

export const parseCriteriaFromParams = (
  params: URLSearchParams,
): FilterCriteria => ({
  regions: parseFacet(params.get('regions'), SERVED_GEOS),
  languages: parseFacet(params.get('languages'), SPOKEN_LANGUAGES),
  categories: parseFacet(params.get('categories'), PARTNER_SCOPES),
});

const encodeFacet = (set: ReadonlySet<string>): string | null =>
  set.size === 0 ? null : Array.from(set).sort().join(',');

export const buildQueryString = (criteria: FilterCriteria): string => {
  const params = new URLSearchParams();
  const r = encodeFacet(criteria.regions);
  const l = encodeFacet(criteria.languages);
  const c = encodeFacet(criteria.categories);
  if (r) params.set('regions', r);
  if (l) params.set('languages', l);
  if (c) params.set('categories', c);
  return params.toString();
};

export const toggleInSet = <T>(
  set: ReadonlySet<T>,
  value: T,
): ReadonlySet<T> => {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
};
