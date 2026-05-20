import type {
  DeploymentExpertise,
  ServedGeo,
  SpokenLanguage,
} from '@/lib/twenty-api';

import type { FilterCriteria } from './filter-partners';

export const ALL_REGIONS: readonly ServedGeo[] = [
  'EUROPE',
  'US',
  'LATAM',
  'MENA',
  'APAC',
  'AFRICA',
];

export const ALL_LANGUAGES: readonly SpokenLanguage[] = [
  'ENGLISH',
  'FRENCH',
  'GERMAN',
  'CHINESE',
  'SPANISH',
];

export const ALL_DEPLOYMENTS: readonly DeploymentExpertise[] = [
  'CLOUD',
  'SELF_HOST',
];

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
  regions: parseFacet(params.get('regions'), ALL_REGIONS),
  languages: parseFacet(params.get('languages'), ALL_LANGUAGES),
  deployments: parseFacet(params.get('deployments'), ALL_DEPLOYMENTS),
});

const encodeFacet = (set: ReadonlySet<string>): string | null =>
  set.size === 0 ? null : Array.from(set).join(',');

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
