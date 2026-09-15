'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, SectionShell } from '@/ui';

import { AppsGrid } from './AppsGrid';
import { type MarketplaceApp } from './marketplace-app';

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
  margin-bottom: ${spacing(6)};
`;

const FilterChip = styled.button`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(4)};
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.04em;
  padding: ${spacing(2)} ${spacing(4)};
  text-transform: uppercase;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: ${semanticColor.lineStrong};
    color: ${semanticColor.ink};
  }

  &[data-active='true'] {
    background-color: ${color('black')};
    border-color: ${color('black')};
    color: ${color('white')};
  }
`;

const EmptyState = styled.div`
  padding-block: ${spacing(10)};
  text-align: center;
`;

const ALL_CATEGORIES = 'all';

type AppsMarketplaceClientProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsMarketplaceClient({ apps }: AppsMarketplaceClientProps) {
  const { i18n } = useLingui();
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);

  const categories = useMemo(() => {
    const seen: string[] = [];

    for (const app of apps) {
      if (app.category.length > 0 && !seen.includes(app.category)) {
        seen.push(app.category);
      }
    }

    return seen.toSorted((a, b) => a.localeCompare(b));
  }, [apps]);

  const visibleApps = useMemo(() => {
    const matching =
      activeCategory === ALL_CATEGORIES
        ? apps
        : apps.filter((app) => app.category === activeCategory);

    return matching.toSorted((a, b) => Number(b.isVetted) - Number(a.isVetted));
  }, [apps, activeCategory]);

  return (
    <SectionShell rhythm="section" scheme="light">
      {apps.length === 0 ? (
        <EmptyState>
          <Body muted size="md">
            {i18n._(msg`No apps are available right now. Check back soon.`)}
          </Body>
        </EmptyState>
      ) : (
        <>
          {categories.length > 0 && (
            <FilterRow
              role="group"
              aria-label={i18n._(msg`Filter apps by category`)}
            >
              <FilterChip
                type="button"
                aria-pressed={activeCategory === ALL_CATEGORIES}
                data-active={activeCategory === ALL_CATEGORIES}
                onClick={() => setActiveCategory(ALL_CATEGORIES)}
              >
                {i18n._(msg`All`)}
              </FilterChip>
              {categories.map((category) => (
                <FilterChip
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  data-active={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </FilterChip>
              ))}
            </FilterRow>
          )}
          <AppsGrid apps={visibleApps} />
        </>
      )}
    </SectionShell>
  );
}
