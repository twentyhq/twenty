'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  DEPLOYMENT_EXPERTISES,
  SERVED_GEOS,
  SPOKEN_LANGUAGES,
  type DeploymentExpertise,
  type ServedGeo,
  type SpokenLanguage,
} from '@/lib/partners-api';
import { theme } from '@/theme';

import type { FilterCriteria } from '../filter-partners';
import {
  DEPLOYMENT_EXPERTISE_LABELS,
  SERVED_GEO_LABELS,
  SPOKEN_LANGUAGE_LABELS,
} from './chip-labels';
import { ClearFiltersButton } from './ClearFiltersButton';
import { FilterChipRow } from './FilterChipRow';

type FilterBarProps = {
  criteria: FilterCriteria;
  totalCount: number;
  visibleCount: number;
  hasAnyFilter: boolean;
  onToggleRegion: (geo: ServedGeo) => void;
  onToggleLanguage: (lang: SpokenLanguage) => void;
  onToggleDeployment: (dep: DeploymentExpertise) => void;
  onClearAll: () => void;
};

const BarSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
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
  onToggleDeployment,
  onClearAll,
}: FilterBarProps) {
  const { i18n } = useLingui();

  return (
    <BarSection aria-label={i18n._(msg`Filter partners`)}>
      <FilterChipRow
        label={msg`Regions`}
        values={SERVED_GEOS}
        valueLabels={SERVED_GEO_LABELS}
        selected={criteria.regions}
        onToggle={onToggleRegion}
      />
      <FilterChipRow
        label={msg`Languages`}
        values={SPOKEN_LANGUAGES}
        valueLabels={SPOKEN_LANGUAGE_LABELS}
        selected={criteria.languages}
        onToggle={onToggleLanguage}
      />
      <FilterChipRow
        label={msg`Deploys`}
        values={DEPLOYMENT_EXPERTISES}
        valueLabels={DEPLOYMENT_EXPERTISE_LABELS}
        selected={criteria.deployments}
        onToggle={onToggleDeployment}
      />
      <Footer>
        <ResultCount aria-live="polite">
          {hasAnyFilter
            ? i18n._(msg`Showing ${visibleCount} of ${totalCount} partners`)
            : i18n._(msg`Showing all ${totalCount} partners`)}
        </ResultCount>
        {hasAnyFilter && (
          <ClearFiltersButton onClick={onClearAll}>
            {i18n._(msg`Clear filters`)}
          </ClearFiltersButton>
        )}
      </Footer>
    </BarSection>
  );
}
