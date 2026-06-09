'use client';

import { useMemo } from 'react';

import { Container } from '@/design-system/components';
import type { MarketplacePartner } from '@/lib/partners-api';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { filterPartners } from './filter-partners';
import { useFilterState } from './use-filter-state';
import { EmptyState } from './components/EmptyState';
import { FilterBar } from './components/FilterBar';
import { MarketplaceGrid } from './components/MarketplaceGrid';

const FilterBarOuter = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  width: 100%;
`;

const FilterBarInner = styled(Container)`
  padding-bottom: ${theme.spacing(6)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(4)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(0)};
  }
`;

type MarketplaceClientProps = {
  partners: readonly MarketplacePartner[];
  locale: string;
};

export function MarketplaceClient({
  partners,
  locale,
}: MarketplaceClientProps) {
  const {
    criteria,
    toggleRegion,
    toggleLanguage,
    toggleCategory,
    clearAll,
    hasAnyFilter,
  } = useFilterState();

  const filteredPartners = useMemo(
    () => filterPartners(partners, criteria),
    [partners, criteria],
  );

  return (
    <>
      <FilterBarOuter>
        <FilterBarInner>
          <FilterBar
            criteria={criteria}
            totalCount={partners.length}
            visibleCount={filteredPartners.length}
            hasAnyFilter={hasAnyFilter}
            onToggleRegion={toggleRegion}
            onToggleLanguage={toggleLanguage}
            onToggleCategory={toggleCategory}
            onClearAll={clearAll}
          />
        </FilterBarInner>
      </FilterBarOuter>
      {filteredPartners.length === 0 ? (
        <EmptyState onClearFilters={clearAll} />
      ) : (
        <MarketplaceGrid partners={filteredPartners} locale={locale} />
      )}
    </>
  );
}
