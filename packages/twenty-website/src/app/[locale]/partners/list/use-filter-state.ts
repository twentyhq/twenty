'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import type {
  PartnerScope,
  ServedGeo,
  SpokenLanguage,
} from '@/lib/partners-api';

import {
  type FilterCriteria,
  hasAnyFilter as computeHasAnyFilter,
} from './filter-partners';
import {
  buildQueryString,
  parseCriteriaFromParams,
  toggleInSet,
} from './filter-url-helpers';

type UseFilterStateReturn = {
  criteria: FilterCriteria;
  toggleRegion: (geo: ServedGeo) => void;
  toggleLanguage: (lang: SpokenLanguage) => void;
  toggleCategory: (scope: PartnerScope) => void;
  clearAll: () => void;
  hasAnyFilter: boolean;
};

export const useFilterState = (): UseFilterStateReturn => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const criteria = useMemo(
    () => parseCriteriaFromParams(new URLSearchParams(params.toString())),
    [params],
  );

  const writeCriteria = useCallback(
    (next: FilterCriteria) => {
      const qs = buildQueryString(next);
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.replace(url, { scroll: false });
    },
    [pathname, router],
  );

  const toggleRegion = useCallback(
    (geo: ServedGeo) => {
      writeCriteria({
        ...criteria,
        regions: toggleInSet(criteria.regions, geo),
      });
    },
    [criteria, writeCriteria],
  );

  const toggleLanguage = useCallback(
    (lang: SpokenLanguage) => {
      writeCriteria({
        ...criteria,
        languages: toggleInSet(criteria.languages, lang),
      });
    },
    [criteria, writeCriteria],
  );

  const toggleCategory = useCallback(
    (scope: PartnerScope) => {
      writeCriteria({
        ...criteria,
        categories: toggleInSet(criteria.categories, scope),
      });
    },
    [criteria, writeCriteria],
  );

  const clearAll = useCallback(() => {
    writeCriteria({
      regions: new Set(),
      languages: new Set(),
      categories: new Set(),
    });
  }, [writeCriteria]);

  return {
    criteria,
    toggleRegion,
    toggleLanguage,
    toggleCategory,
    clearAll,
    hasAnyFilter: computeHasAnyFilter(criteria),
  };
};
