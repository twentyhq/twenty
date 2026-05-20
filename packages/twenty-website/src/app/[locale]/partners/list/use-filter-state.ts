'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import type {
  DeploymentExpertise,
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
  toggleDeployment: (dep: DeploymentExpertise) => void;
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

  const toggleDeployment = useCallback(
    (dep: DeploymentExpertise) => {
      writeCriteria({
        ...criteria,
        deployments: toggleInSet(criteria.deployments, dep),
      });
    },
    [criteria, writeCriteria],
  );

  const clearAll = useCallback(() => {
    writeCriteria({
      regions: new Set(),
      languages: new Set(),
      deployments: new Set(),
    });
  }, [writeCriteria]);

  return {
    criteria,
    toggleRegion,
    toggleLanguage,
    toggleDeployment,
    clearAll,
    hasAnyFilter: computeHasAnyFilter(criteria),
  };
};
