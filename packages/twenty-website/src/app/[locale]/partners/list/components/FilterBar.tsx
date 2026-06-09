'use client';

import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  PARTNER_SCOPES,
  SERVED_GEOS,
  SPOKEN_LANGUAGES,
  type PartnerScope,
  type ServedGeo,
  type SpokenLanguage,
} from '@/lib/partners-api';
import { theme } from '@/theme';

import type { FilterCriteria } from '../filter-partners';
import {
  PARTNER_SCOPE_LABELS,
  SERVED_GEO_LABELS,
  SPOKEN_LANGUAGE_LABELS,
} from './chip-labels';
import { ClearFiltersButton } from './ClearFiltersButton';
import { ActiveFilterPills, type ActivePill } from './ActiveFilterPills';
import { FilterDropdown } from './FilterDropdown';

type FilterBarProps = {
  criteria: FilterCriteria;
  totalCount: number;
  visibleCount: number;
  hasAnyFilter: boolean;
  onToggleRegion: (geo: ServedGeo) => void;
  onToggleLanguage: (lang: SpokenLanguage) => void;
  onToggleCategory: (scope: PartnerScope) => void;
  onClearAll: () => void;
};

const BarSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
`;

const DropdownRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
`;

const Footer = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(3)};
  justify-content: space-between;
  padding-top: ${theme.spacing(2)};
`;

const ResultCount = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  line-height: ${theme.lineHeight(4)};
  margin: 0;
`;

export function FilterBar({
  criteria,
  totalCount,
  visibleCount,
  hasAnyFilter,
  onToggleRegion,
  onToggleLanguage,
  onToggleCategory,
  onClearAll,
}: FilterBarProps) {
  const { i18n } = useLingui();

  const pills: ActivePill[] = [
    ...[...criteria.regions].map((geo) => ({
      key: `region:${geo}`,
      text: i18n._(SERVED_GEO_LABELS[geo]),
      onRemove: () => onToggleRegion(geo),
    })),
    ...[...criteria.languages].map((lang) => ({
      key: `language:${lang}`,
      text: i18n._(SPOKEN_LANGUAGE_LABELS[lang]),
      onRemove: () => onToggleLanguage(lang),
    })),
    ...[...criteria.categories].map((scope) => ({
      key: `category:${scope}`,
      text: i18n._(PARTNER_SCOPE_LABELS[scope]),
      onRemove: () => onToggleCategory(scope),
    })),
  ];

  return (
    <BarSection aria-label={i18n._(msg`Filter partners`)}>
      <DropdownRow>
        <FilterDropdown
          label={msg`Regions`}
          options={SERVED_GEOS}
          optionLabels={SERVED_GEO_LABELS}
          selected={criteria.regions}
          onToggle={onToggleRegion}
        />
        <FilterDropdown
          label={msg`Languages`}
          options={SPOKEN_LANGUAGES}
          optionLabels={SPOKEN_LANGUAGE_LABELS}
          selected={criteria.languages}
          onToggle={onToggleLanguage}
        />
        <FilterDropdown
          label={msg`Categories`}
          options={PARTNER_SCOPES}
          optionLabels={PARTNER_SCOPE_LABELS}
          selected={criteria.categories}
          onToggle={onToggleCategory}
        />
      </DropdownRow>
      {hasAnyFilter && <ActiveFilterPills pills={pills} />}
      <Footer>
        <ResultCount aria-live="polite">
          {hasAnyFilter ? (
            <Trans>
              Showing {visibleCount} of {totalCount} partners
            </Trans>
          ) : (
            <Trans>Showing all {totalCount} partners</Trans>
          )}
        </ResultCount>
        {hasAnyFilter && (
          <ClearFiltersButton onClick={onClearAll}>
            <Trans>Clear filters</Trans>
          </ClearFiltersButton>
        )}
      </Footer>
    </BarSection>
  );
}
