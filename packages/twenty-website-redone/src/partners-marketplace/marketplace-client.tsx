'use client';

import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { spacing } from '@/tokens';
import { SectionShell } from '@/ui';

import { MarketplaceEmptyState } from './empty-state';
import { FilterBar } from './filter-bar';
import { filterPartners } from './filter-partners';
import { MarketplaceGrid } from './marketplace-grid';
import { type MarketplacePartner } from './marketplace-partner';
import { useMarketplaceFilterState } from './use-marketplace-filter-state';

const Results = styled.div`
  margin-top: ${spacing(6)};
`;

export function MarketplaceClient({
  partners,
  locale,
}: {
  partners: readonly MarketplacePartner[];
  locale: string;
}) {
  const {
    criteria,
    hasAnyFilter,
    toggleRegion,
    toggleLanguage,
    toggleCategory,
    clearAll,
  } = useMarketplaceFilterState();

  const filteredPartners = useMemo(
    () => filterPartners(partners, criteria),
    [partners, criteria],
  );

  return (
    <SectionShell rhythm="section" scheme="light">
      <FilterBar
        criteria={criteria}
        hasAnyFilter={hasAnyFilter}
        onClearAll={clearAll}
        onToggleCategory={toggleCategory}
        onToggleLanguage={toggleLanguage}
        onToggleRegion={toggleRegion}
        totalCount={partners.length}
        visibleCount={filteredPartners.length}
      />
      <Results>
        {filteredPartners.length > 0 ? (
          <MarketplaceGrid partners={filteredPartners} locale={locale} />
        ) : (
          <MarketplaceEmptyState onClearFilters={clearAll} />
        )}
      </Results>
    </SectionShell>
  );
}
