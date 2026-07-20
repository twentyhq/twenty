'use client';

import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { spacing } from '@/tokens';
import { SectionShell } from '@/ui';

import { MarketplaceBriefPrompt } from './MarketplaceBriefPrompt';
import { MarketplaceEmptyState } from './EmptyState';
import { FilterBar } from './FilterBar';
import { filterPartners } from './filter-partners';
import { MarketplaceGrid } from './MarketplaceGrid';
import { type MarketplacePartner } from './marketplace-partner';
import { useMarketplaceFilterState } from './use-marketplace-filter-state';

const Results = styled.div`
  margin-top: ${spacing(6)};
`;

export function MarketplaceClient({
  partners,
}: {
  partners: readonly MarketplacePartner[];
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
    <>
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
          <MarketplaceGrid partners={filteredPartners} />
          {filteredPartners.length === 0 && partners.length > 0 && (
            <MarketplaceEmptyState onClearFilters={clearAll} />
          )}
        </Results>
      </SectionShell>
      {partners.length > 0 && <MarketplaceBriefPrompt />}
    </>
  );
}
