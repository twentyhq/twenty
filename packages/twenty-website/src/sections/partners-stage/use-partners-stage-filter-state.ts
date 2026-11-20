'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { buildFilterQuery } from '@/partners-marketplace/build-filter-query';
import {
  EMPTY_FILTER_CRITERIA,
  type FilterCriteria,
} from '@/partners-marketplace/filter-criteria';
import { hasAnyFilter } from '@/partners-marketplace/has-any-filter';
import { parseFilterCriteria } from '@/partners-marketplace/parse-filter-criteria';
import { type PartnerScope } from '@/partners-marketplace/partner-scopes';
import { type ServedGeo } from '@/partners-marketplace/served-geos';
import { type SpokenLanguage } from '@/partners-marketplace/spoken-languages';
import { toggleInSet } from '@/partners-marketplace/toggle-in-set';

const FACET_KEYS = ['regions', 'languages', 'categories'];

export type PartnersStageFilterState = {
  criteria: FilterCriteria;
  hasAnyFilter: boolean;
  toggleRegion: (geo: ServedGeo) => void;
  toggleLanguage: (language: SpokenLanguage) => void;
  toggleCategory: (scope: PartnerScope) => void;
  clearFacet: (facet: keyof FilterCriteria) => void;
  clearAll: () => void;
};
// Same contract as useMarketplaceFilterState (the URL is the source of truth),
// but it keeps the other query params, which the original drops: the prototype
// switch lives in one.
export const usePartnersStageFilterState = (): PartnersStageFilterState => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const criteria = useMemo(
    () => parseFilterCriteria(new URLSearchParams(params.toString())),
    [params],
  );

  const writeCriteria = useCallback(
    (next: FilterCriteria) => {
      const nextParams = new URLSearchParams(params.toString());
      for (const key of FACET_KEYS) {
        nextParams.delete(key);
      }
      for (const [key, value] of new URLSearchParams(buildFilterQuery(next))) {
        nextParams.set(key, value);
      }
      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router],
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

  // One write per facet: toggling each value off in turn would race, every
  // toggle starting from the same URL.
  const clearFacet = useCallback(
    (facet: keyof FilterCriteria) =>
      writeCriteria({ ...criteria, [facet]: new Set() }),
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
    clearFacet,
    clearAll,
  };
};
