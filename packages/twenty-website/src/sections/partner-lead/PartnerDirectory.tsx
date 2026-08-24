'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { MarketplaceEmptyState } from '@/partners-marketplace/EmptyState';
import { filterPartners } from '@/partners-marketplace/filter-partners';
import { FilterBar } from '@/partners-marketplace/FilterBar';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { MarketplaceGrid } from '@/partners-marketplace/MarketplaceGrid';
import { useMarketplaceFilterState } from '@/partners-marketplace/use-marketplace-filter-state';
import { PARTNER_DIRECTORY_ANCHOR_ID } from '@/platform/routing/partner-directory-anchor-id';
import { spacing } from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

const ZoneHeader = styled.div`
  max-width: 640px;
  scroll-margin-top: ${spacing(22)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Filters = styled.div`
  margin-top: ${spacing(10)};
`;

// Mirrors the old marketplace list's own spacing so the grid sits exactly as it
// did on /partners/list; the brief band it bundled is rendered by the page.
const Results = styled.div`
  margin-top: ${spacing(6)};
`;

type PartnerDirectoryProps = {
  partners: readonly MarketplacePartner[];
};

export function PartnerDirectory({ partners }: PartnerDirectoryProps) {
  const { i18n } = useLingui();
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
      <ZoneHeader id={PARTNER_DIRECTORY_ANCHOR_ID}>
        <Eyebrow>{i18n._(msg`Directory`)}</Eyebrow>
        <Heading as="h2" size="lg" weight="light">
          {i18n._(msg`Browse the *certified partners*`)}
        </Heading>
        <Body muted size="md">
          {i18n._(
            msg`Filter by region, language, and specialty, then read a profile and book a call with the partner yourself.`,
          )}
        </Body>
      </ZoneHeader>
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
    </SectionShell>
  );
}
