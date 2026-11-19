'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';

import {
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { AppCard } from './AppCard';
import { type MarketplaceApp } from './marketplace-app';

// PROTOTYPE (direction B): Linear's catalogue structure, categories as a
// plain list on the left instead of the chip row. Not for a PR as is.
const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(8)};

  ${mediaUp('md')} {
    column-gap: ${spacing(16)};
    display: grid;
    grid-template-columns: 13rem minmax(0, 1fr);
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)} ${spacing(6)};

  ${mediaUp('md')} {
    align-self: flex-start;
    flex-direction: column;
    flex-wrap: nowrap;
    gap: ${spacing(1)};
    position: sticky;
    top: ${spacing(24)};
  }
`;

const CategoryItem = styled.button`
  align-items: baseline;
  background: none;
  border: 0;
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  gap: ${spacing(2)};
  justify-content: space-between;
  padding: ${spacing(2)} 0;
  text-align: left;
  transition: color 0.2s ease;

  &:hover {
    color: ${semanticColor.ink};
  }

  &[data-active='true'] {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  &:focus-visible {
    outline: 2px solid ${semanticColor.ink};
    outline-offset: 2px;
  }
`;

const CategoryCount = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-variant-numeric: tabular-nums;
  font-weight: ${FONT_WEIGHT.regular};
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};
  min-width: 0;
`;

const ResultsHead = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  padding-bottom: ${spacing(5)};
`;

const CardGrid = styled.div`
  display: grid;
  gap: ${spacing(6)};
  grid-template-columns: 1fr;

  @media (min-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const EmptyState = styled.div`
  padding-block: ${spacing(10)};
  text-align: center;
`;

const ALL_CATEGORIES = 'all';

type AppsMarketplaceClientDirectionBProps = {
  apps: readonly MarketplaceApp[];
  isUnavailable: boolean;
};

export function AppsMarketplaceClientDirectionB({
  apps,
  isUnavailable,
}: AppsMarketplaceClientDirectionBProps) {
  const { i18n } = useLingui();
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);

  const categories = useMemo(() => {
    const countByCategory = new Map<string, number>();

    for (const app of apps) {
      if (app.category.length > 0) {
        countByCategory.set(
          app.category,
          (countByCategory.get(app.category) ?? 0) + 1,
        );
      }
    }

    return [...countByCategory.entries()].toSorted((left, right) =>
      left[0].localeCompare(right[0]),
    );
  }, [apps]);

  const visibleApps = useMemo(() => {
    return activeCategory === ALL_CATEGORIES
      ? apps
      : apps.filter((app) => app.category === activeCategory);
  }, [apps, activeCategory]);

  if (apps.length === 0) {
    return (
      <SectionShell rhythm="section" scheme="light">
        <EmptyState>
          <Body muted size="md">
            {isUnavailable
              ? i18n._(
                  msg`Apps can't be loaded right now. Try again in a few minutes.`,
                )
              : i18n._(msg`No apps are available right now. Check back soon.`)}
          </Body>
        </EmptyState>
      </SectionShell>
    );
  }

  return (
    <SectionShell rhythm="section" scheme="light">
      <Layout>
        <CategoryList
          role="group"
          aria-label={i18n._(msg`Filter apps by category`)}
        >
          <CategoryItem
            type="button"
            aria-pressed={activeCategory === ALL_CATEGORIES}
            data-active={activeCategory === ALL_CATEGORIES}
            onClick={() => setActiveCategory(ALL_CATEGORIES)}
          >
            {i18n._(msg`All apps`)}
            <CategoryCount>{apps.length}</CategoryCount>
          </CategoryItem>
          {categories.map(([category, count]) => (
            <CategoryItem
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              data-active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
              <CategoryCount>{count}</CategoryCount>
            </CategoryItem>
          ))}
        </CategoryList>
        <Results>
          <ResultsHead>
            <Heading as="h2" size="xs" weight="regular">
              {activeCategory === ALL_CATEGORIES
                ? i18n._(msg`All apps`)
                : activeCategory}
            </Heading>
            <Body muted size="sm">
              {visibleApps.length === 1
                ? i18n._(msg`1 app`)
                : i18n._(msg`${visibleApps.length} apps`)}
            </Body>
          </ResultsHead>
          <CardGrid>
            {visibleApps.map((app, index) => (
              <AppCard key={app.slug} app={app} index={index} />
            ))}
          </CardGrid>
        </Results>
      </Layout>
    </SectionShell>
  );
}
