'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconX } from '@tabler/icons-react';

import {
  color,
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { type FilterFacet } from './filter-facet';
import { FilterDropdown } from './FilterDropdown';

// One filter for every list on the site (partners, apps): a menu per facet
// with the result count beside them, then the active values as removable
// pills with a single "Clear all". A facet with fewer than two values has
// nothing to filter and is left out; with none left, the bar is not drawn.

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
`;

const TopRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)} ${spacing(4)};
  justify-content: space-between;
`;

const Menus = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
`;

const Count = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  line-height: ${fontSize(4)};
`;

const Pills = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1.5)};
`;

const Pill = styled.span`
  align-items: center;
  background: ${color('black-5')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(4)};
  color: ${color('black-80')};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  gap: ${spacing(1)};
  line-height: ${fontSize(4)};
  padding: ${spacing(0.5)} ${spacing(1.5)};
`;

const RemoveButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  padding: 0;
  transition: color ${DURATION.xxs} ${EASING.gentle};

  &:focus-visible {
    border-radius: ${radius(0.5)};
    outline: 2px solid ${color('blue')};
    outline-offset: 2px;
  }
  color: ${semanticColor.inkSubtle};
  flex-shrink: 0;

  &:hover {
    color: ${semanticColor.ink};
  }
`;

const ClearAll = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  padding: 0;
  transition: color ${DURATION.xxs} ${EASING.gentle};

  &:focus-visible {
    border-radius: ${radius(0.5)};
    outline: 2px solid ${color('blue')};
    outline-offset: 2px;
  }
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  line-height: ${fontSize(4)};
  margin-left: ${spacing(1.5)};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${semanticColor.ink};
  }
`;

type FilterBarProps = {
  ariaLabel: string;
  facets: readonly FilterFacet[];
  onClearAll: () => void;
  onToggle: (facetKey: string, value: string) => void;
  // "49 partners", "7 of 49 apps": worded by the page.
  resultCount: string;
};

export function FilterBar({
  ariaLabel,
  facets,
  onClearAll,
  onToggle,
  resultCount,
}: FilterBarProps) {
  const { i18n } = useLingui();
  const usefulFacets = facets.filter((facet) => facet.options.length > 1);
  if (usefulFacets.length === 0) {
    return null;
  }

  const activeValues = usefulFacets.flatMap((facet) =>
    facet.options
      .filter((option) => facet.selected.has(option.value))
      .map((option) => ({ facetKey: facet.key, option })),
  );

  return (
    <Root aria-label={ariaLabel} role="search">
      <TopRow>
        <Menus>
          {usefulFacets.map((facet) => (
            <FilterDropdown
              facet={facet}
              key={facet.key}
              onToggle={(value) => onToggle(facet.key, value)}
            />
          ))}
        </Menus>
        <Count aria-live="polite">{resultCount}</Count>
      </TopRow>
      {activeValues.length > 0 && (
        <Pills aria-label={i18n._(msg`Active filters`)}>
          {activeValues.map(({ facetKey, option }) => (
            <Pill key={`${facetKey}:${option.value}`}>
              {option.label}
              <RemoveButton
                aria-label={i18n._(msg`Remove ${option.label} filter`)}
                onClick={() => onToggle(facetKey, option.value)}
                type="button"
              >
                <IconX aria-hidden size={12} strokeWidth={2} />
              </RemoveButton>
            </Pill>
          ))}
          <ClearAll onClick={onClearAll} type="button">
            {i18n._(msg`Clear all`)}
          </ClearAll>
        </Pills>
      )}
    </Root>
  );
}
