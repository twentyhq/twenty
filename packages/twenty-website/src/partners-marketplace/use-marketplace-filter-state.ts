'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { buildFilterQuery } from './build-filter-query';
import { EMPTY_FILTER_CRITERIA, type FilterCriteria } from './filter-criteria';
import { hasAnyFilter } from './has-any-filter';
import { parseFilterCriteria } from './parse-filter-criteria';
import { type PartnerScope } from './partner-scopes';
import { type ServedGeo } from './served-geos';
import { type SpokenLanguage } from './spoken-languages';
import { toggleInSet } from './toggle-in-set';

export type MarketplaceFilterState = {
  criteria: FilterCriteria;
  hasAnyFilter: boolean;
  toggleRegion: (geo: ServedGeo) => void;
  toggleLanguage: (language: SpokenLanguage) => void;
  toggleCategory: (scope: PartnerScope) => void;
  clearAll: () => void;
};

// The URL is the single source of truth for the active filters: criteria are
// parsed from the query string and every toggle rewrites it (replace, no scroll
// jump), so a filtered view is shareable and survives reload/back.
export const useMarketplaceFilterState = (): MarketplaceFilterState => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const criteria = useMemo(
    () => parseFilterCriteria(new URLSearchParams(params.toString())),
    [params],
  );

  const writeCriteria = useCallback(
    (next: FilterCriteria) => {
      const query = buildFilterQuery(next);
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const toggleRegion = useCallback(
    (geo: ServedGeo) =>
      writeCriteria({
        ...criteria,
        regions: toggleInSet(criteria.regions, geo),
      }),
    [criteria, writeCriteria],
  );

  const toggleLanguage = useCallback(
    (language: SpokenLanguage) =>
      writeCriteria({
        ...criteria,
        languages: toggleInSet(criteria.languages, language),
      }),
    [criteria, writeCriteria],
  );

  const toggleCategory = useCallback(
    (scope: PartnerScope) =>
      writeCriteria({
        ...criteria,
        categories: toggleInSet(criteria.categories, scope),
      }),
    [criteria, writeCriteria],
  );

  const clearAll = useCallback(
    () => writeCriteria(EMPTY_FILTER_CRITERIA),
    [writeCriteria],
  );

  return {
    criteria,
    hasAnyFilter: hasAnyFilter(criteria),
    toggleRegion,
    toggleLanguage,
    toggleCategory,
    clearAll,
  };
};
