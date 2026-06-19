'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { fontFamily, fontSize, semanticColor, spacing } from '@/tokens';
import { Button } from '@/ui';

import { ActiveFilterPills, type ActivePill } from './ActiveFilterPills';
import { type FilterCriteria } from './filter-criteria';
import { FilterDropdown } from './FilterDropdown';
import { PARTNER_SCOPE_LABELS } from './partner-scope-labels';
import { PARTNER_SCOPES, type PartnerScope } from './partner-scopes';
import { SERVED_GEO_LABELS } from './served-geo-labels';
import { SERVED_GEOS, type ServedGeo } from './served-geos';
import { SPOKEN_LANGUAGE_LABELS } from './spoken-language-labels';
import { SPOKEN_LANGUAGES, type SpokenLanguage } from './spoken-languages';

type FilterBarProps = {
  criteria: FilterCriteria;
  hasAnyFilter: boolean;
  onClearAll: () => void;
  onToggleCategory: (scope: PartnerScope) => void;
  onToggleLanguage: (language: SpokenLanguage) => void;
  onToggleRegion: (geo: ServedGeo) => void;
  totalCount: number;
  visibleCount: number;
};

// Margins (not gap) carry the vertical rhythm so the pills row can appear and
// disappear without leaving a phantom gap.
const BarRoot = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const DropdownRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
`;

const Footer = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: space-between;
  padding-top: ${spacing(2)};
`;

const ResultCount = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  line-height: ${fontSize(4)};
`;

export function FilterBar({
  criteria,
  hasAnyFilter,
  onClearAll,
  onToggleCategory,
  onToggleLanguage,
  onToggleRegion,
  totalCount,
  visibleCount,
}: FilterBarProps) {
  const { i18n } = useLingui();

  const pills: ActivePill[] = [
    ...[...criteria.regions].map((geo) => ({
      key: `region:${geo}`,
      text: i18n._(SERVED_GEO_LABELS[geo]),
      onRemove: () => onToggleRegion(geo),
    })),
    ...[...criteria.languages].map((language) => ({
      key: `language:${language}`,
      text: i18n._(SPOKEN_LANGUAGE_LABELS[language]),
      onRemove: () => onToggleLanguage(language),
    })),
    ...[...criteria.categories].map((scope) => ({
      key: `category:${scope}`,
      text: i18n._(PARTNER_SCOPE_LABELS[scope]),
      onRemove: () => onToggleCategory(scope),
    })),
  ];

  return (
    <BarRoot aria-label={i18n._(msg`Filter partners`)} role="search">
      <DropdownRow>
        <FilterDropdown
          label={msg`Regions`}
          onToggle={onToggleRegion}
          optionLabels={SERVED_GEO_LABELS}
          options={SERVED_GEOS}
          selected={criteria.regions}
        />
        <FilterDropdown
          label={msg`Languages`}
          onToggle={onToggleLanguage}
          optionLabels={SPOKEN_LANGUAGE_LABELS}
          options={SPOKEN_LANGUAGES}
          selected={criteria.languages}
        />
        <FilterDropdown
          label={msg`Categories`}
          onToggle={onToggleCategory}
          optionLabels={PARTNER_SCOPE_LABELS}
          options={PARTNER_SCOPES}
          selected={criteria.categories}
        />
      </DropdownRow>
      {hasAnyFilter && <ActiveFilterPills pills={pills} />}
      <Footer>
        <ResultCount aria-live="polite">
          {hasAnyFilter
            ? i18n._(msg`Showing ${visibleCount} of ${totalCount} partners`)
            : i18n._(msg`Showing all ${totalCount} partners`)}
        </ResultCount>
        {hasAnyFilter && (
          <Button
            label={i18n._(msg`Clear filters`)}
            onClick={onClearAll}
            size="small"
            variant="outlined"
          />
        )}
      </Footer>
    </BarRoot>
  );
}
