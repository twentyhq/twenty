import {
  DEPLOYMENT_EXPERTISES,
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
  deployments: parseFacet(params.get('deployments'), DEPLOYMENT_EXPERTISES),
});

const encodeFacet = (set: ReadonlySet<string>): string | null =>
  set.size === 0 ? null : Array.from(set).sort().join(',');

export const buildQueryString = (criteria: FilterCriteria): string => {
  const params = new URLSearchParams();
  const r = encodeFacet(criteria.regions);
  const l = encodeFacet(criteria.languages);
  const d = encodeFacet(criteria.deployments);
  if (r) params.set('regions', r);
  if (l) params.set('languages', l);
  if (d) params.set('deployments', d);
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
