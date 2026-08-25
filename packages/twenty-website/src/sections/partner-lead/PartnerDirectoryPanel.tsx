'use client';

import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { MarketplaceEmptyState } from '@/partners-marketplace/EmptyState';
import { filterPartners } from '@/partners-marketplace/filter-partners';
import { FilterBar } from '@/partners-marketplace/FilterBar';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { MarketplaceGrid } from '@/partners-marketplace/MarketplaceGrid';
import { useMarketplaceFilterState } from '@/partners-marketplace/use-marketplace-filter-state';
import { spacing } from '@/tokens';

const Filters = styled.div`
  margin-top: ${spacing(10)};
`;

const Results = styled.div`
  margin-top: ${spacing(6)};
`;

type PartnerDirectoryPanelProps = {
  partners: readonly MarketplacePartner[];
};

export function PartnerDirectoryPanel({
  partners,
}: PartnerDirectoryPanelProps) {
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
      <Filters>
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
      </Filters>
      <Results>
        <MarketplaceGrid partners={filteredPartners} />
        {filteredPartners.length === 0 && partners.length > 0 && (
          <MarketplaceEmptyState onClearFilters={clearAll} />
        )}
      </Results>
    </>
  );
}
