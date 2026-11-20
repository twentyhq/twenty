'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type ReactNode, useMemo } from 'react';

import { MarketplaceEmptyState } from '@/partners-marketplace/EmptyState';
import { FilterDropdown } from '@/partners-marketplace/FilterDropdown';
import { filterPartners } from '@/partners-marketplace/filter-partners';
import { MARKETPLACE_COPY } from '@/partners-marketplace/marketplace-copy';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { PARTNER_SCOPE_LABELS } from '@/partners-marketplace/partner-scope-labels';
import {
  PARTNER_SCOPES,
  type PartnerScope,
} from '@/partners-marketplace/partner-scopes';
import { SERVED_GEO_LABELS } from '@/partners-marketplace/served-geo-labels';
import {
  SERVED_GEOS,
  type ServedGeo,
} from '@/partners-marketplace/served-geos';
import { SPOKEN_LANGUAGE_LABELS } from '@/partners-marketplace/spoken-language-labels';
import { SPOKEN_LANGUAGES } from '@/partners-marketplace/spoken-languages';
import {
  fontFamily,
  fontSize,
  mediaUp,
  MENU_HEIGHT_PX,
  semanticColor,
  spacing,
} from '@/tokens';
import { Button } from '@/ui';

import { PartnersStageEmptyDirectory } from './PartnersStageEmptyDirectory';
import { PartnersStageFilterChip } from './PartnersStageFilterChip';
import { PartnersStagePartnerRow } from './PartnersStagePartnerRow';
import { usePartnersStageFilterState } from './use-partners-stage-filter-state';

// Sticks under the menu so the facets stay in reach down the whole list.
const FilterRail = styled.div`
  background-color: ${semanticColor.surface};
  border-bottom: 1px solid ${semanticColor.ink};
  margin-top: ${spacing(10)};
  padding: ${spacing(4)} 0;
  position: sticky;
  top: ${MENU_HEIGHT_PX}px;
  z-index: 2;

  & > * + * {
    margin-top: ${spacing(3)};
  }

  ${mediaUp('md')} {
    margin-top: ${spacing(14)};
  }
`;

const FacetRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2)} ${spacing(4)};
  justify-content: space-between;
`;

// Chips scroll sideways on phones instead of stacking into a wall.
const ChipScroller = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2)};
  margin-inline: calc(${spacing(4)} * -1);
  min-width: 0;
  overflow-x: auto;
  padding-inline: ${spacing(4)};
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${mediaUp('md')} {
    flex-wrap: wrap;
    margin-inline: 0;
    overflow: visible;
    padding-inline: 0;
  }
`;

const FacetLabel = styled.span`
  color: ${semanticColor.inkMuted};
  flex-shrink: 0;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  line-height: 1.3;
  text-transform: uppercase;

  ${mediaUp('md')} {
    width: 132px;
  }
`;

const RailAside = styled.div`
  align-items: center;
  display: none;
  flex-shrink: 0;
  gap: ${spacing(4)};

  ${mediaUp('md')} {
    display: flex;
  }
`;

const ResultCount = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  line-height: 1.3;
  text-transform: uppercase;
  white-space: nowrap;
`;

const MobileStatus = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(3)};
  justify-content: space-between;

  ${mediaUp('md')} {
    display: none;
  }
`;

const RowList = styled.div`
  min-height: 240px;
`;

const countBy = <FacetValue extends string>(
  partners: readonly MarketplacePartner[],
  pick: (partner: MarketplacePartner) => readonly FacetValue[],
): Map<FacetValue, number> => {
  const counts = new Map<FacetValue, number>();
  for (const partner of partners) {
    for (const value of pick(partner)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
};

type PartnersStageDirectoryPanelProps = {
  matchCta: ReactNode;
  partners: readonly MarketplacePartner[];
};

// PROTOTYPE
export function PartnersStageDirectoryPanel({
  matchCta,
  partners,
}: PartnersStageDirectoryPanelProps) {
  const { i18n } = useLingui();
  const {
    criteria,
    hasAnyFilter,
    toggleRegion,
    toggleLanguage,
    toggleCategory,
    clearAll,
  } = usePartnersStageFilterState();

  const filteredPartners = useMemo(
    () => filterPartners(partners, criteria),
    [partners, criteria],
  );
  const regionCounts = useMemo(
    () => countBy<ServedGeo>(partners, (partner) => partner.region),
    [partners],
  );
  const scopeCounts = useMemo(
    () => countBy<PartnerScope>(partners, (partner) => partner.partnerScope),
    [partners],
  );
  // Only the languages somebody in the directory speaks.
  const spokenLanguages = useMemo(() => {
    const spoken = new Set(
      partners.flatMap((partner) => partner.languagesSpoken),
    );
    return SPOKEN_LANGUAGES.filter(
      (language) => spoken.has(language) || criteria.languages.has(language),
    );
  }, [partners, criteria.languages]);

  if (partners.length === 0) {
    return <PartnersStageEmptyDirectory cta={matchCta} />;
  }

  const handleClear = clearAll;

  const resultCount = hasAnyFilter ? (
    <ResultCount aria-live="polite">
      {i18n._(
        msg`Showing ${filteredPartners.length} of ${partners.length} partners`,
      )}
    </ResultCount>
  ) : null;
  const clearButton = hasAnyFilter ? (
    <Button
      label={i18n._(msg`Clear filters`)}
      onClick={handleClear}
      size="small"
      variant="outlined"
    />
  ) : null;

  // Re-keying the list replays the row stagger on every filter change.
  const listKey = [
    ...criteria.regions,
    ...criteria.languages,
    ...criteria.categories,
  ].join('|');

  return (
    <>
      <FilterRail aria-label={i18n._(msg`Filter partners`)} role="search">
        <FacetRow>
          <ChipScroller>
            <FacetLabel>{i18n._(msg`Regions`)}</FacetLabel>
            {SERVED_GEOS.map((geo) => (
              <PartnersStageFilterChip
                count={regionCounts.get(geo) ?? 0}
                isSelected={criteria.regions.has(geo)}
                key={geo}
                label={i18n._(SERVED_GEO_LABELS[geo])}
                onToggle={() => {
                  toggleRegion(geo);
                }}
              />
            ))}
          </ChipScroller>
          <RailAside>
            {resultCount}
            {clearButton}
          </RailAside>
        </FacetRow>
        <FacetRow>
          <ChipScroller>
            <FacetLabel>
              {i18n._(MARKETPLACE_COPY.partnerScopeHeading)}
            </FacetLabel>
            {PARTNER_SCOPES.map((scope) => (
              <PartnersStageFilterChip
                count={scopeCounts.get(scope) ?? 0}
                isSelected={criteria.categories.has(scope)}
                key={scope}
                label={i18n._(PARTNER_SCOPE_LABELS[scope])}
                onToggle={() => {
                  toggleCategory(scope);
                }}
              />
            ))}
          </ChipScroller>
          <RailAside>
            <FilterDropdown
              label={msg`Languages`}
              onToggle={(language) => {
                toggleLanguage(language);
              }}
              optionLabels={SPOKEN_LANGUAGE_LABELS}
              options={spokenLanguages}
              selected={criteria.languages}
            />
          </RailAside>
        </FacetRow>
        <MobileStatus>
          <FilterDropdown
            label={msg`Languages`}
            onToggle={(language) => {
              toggleLanguage(language);
            }}
            optionLabels={SPOKEN_LANGUAGE_LABELS}
            options={spokenLanguages}
            selected={criteria.languages}
          />
          {clearButton ?? resultCount}
        </MobileStatus>
      </FilterRail>
      <RowList key={listKey}>
        {filteredPartners.map((partner, index) => (
          <PartnersStagePartnerRow
            index={index}
            key={partner.slug}
            partner={partner}
          />
        ))}
        {filteredPartners.length === 0 && (
          <MarketplaceEmptyState onClearFilters={handleClear} />
        )}
      </RowList>
    </>
  );
}
