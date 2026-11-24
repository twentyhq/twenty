'use client';

import { msg, plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { MENU_HEIGHT_PX, radius, semanticColor, spacing } from '@/tokens';
import {
  Body,
  Eyebrow,
  FilterBar,
  FilterEmptyState,
  type FilterFacet,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
  useUrlFilters,
} from '@/ui';

import { AppCards } from './AppCards';
import { type MarketplaceApp } from './marketplace-app';

// Few apps: one grid, the team's picks first.
const FEATURED_APP_NAMES: readonly string[] = [
  'slack',
  'granola',
  'microsoft teams',
];

// The partners directory's header.
const Header = styled.div`
  max-width: 640px;
  scroll-margin-top: ${MENU_HEIGHT_PX}px;
`;

// The partners directory's spacing between the filters and the results.
const Results = styled.div`
  margin-top: ${spacing(6)};
`;

const EmptyState = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(12)} ${spacing(6)};
  text-align: center;
`;

const featuredRank = (app: MarketplaceApp) => {
  const rank = FEATURED_APP_NAMES.indexOf(app.name.trim().toLowerCase());

  return rank === -1 ? FEATURED_APP_NAMES.length : rank;
};

type AppsCatalogueProps = {
  apps: readonly MarketplaceApp[];
  isUnavailable: boolean;
};

export function AppsCatalogue({ apps, isUnavailable }: AppsCatalogueProps) {
  const { i18n } = useLingui();
  const ordered = apps.toSorted(
    (left, right) =>
      featuredRank(left) - featuredRank(right) ||
      left.name.localeCompare(right.name),
  );

  // Categories come from the API, so the allowed values are derived once per
  // catalogue: useUrlFilters keys its parsing on this object's identity.
  const categories = useMemo(
    () =>
      [...new Set(apps.map((app) => app.category))]
        .filter((category) => category.length > 0)
        .toSorted((left, right) => left.localeCompare(right)),
    [apps],
  );
  const filterValues = useMemo(() => ({ category: categories }), [categories]);
  const { clearAll, hasAny, selected, toggle } = useUrlFilters(filterValues);

  const visibleApps = ordered.filter(
    (app) =>
      selected.category.size === 0 || selected.category.has(app.category),
  );

  const facets: FilterFacet[] = [
    {
      key: 'category',
      label: i18n._(msg`Category`),
      options: categories.map((category) => ({
        label: category,
        value: category,
      })),
      selected: selected.category,
    },
  ];

  const total = apps.length;
  const resultCount = hasAny
    ? i18n._(msg`${visibleApps.length} of ${total} apps`)
    : i18n._(msg`${plural(total, { one: '# app', other: '# apps' })}`);

  return (
    <SectionShell rhythm="section" scheme="light">
      <SectionStack>
        <Header id="all-apps" tabIndex={-1}>
          <SectionIntro>
            <Eyebrow>{i18n._(msg`Catalog`)}</Eyebrow>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Browse the *apps*`)}
            </Heading>
            <Body muted size="md">
              {i18n._(
                msg`Open an app to see what it adds, then install it in a click.`,
              )}
            </Body>
          </SectionIntro>
        </Header>
        {ordered.length === 0 ? (
          <EmptyState>
            <Body muted size="sm">
              {isUnavailable
                ? i18n._(
                    msg`Apps can't be loaded right now. Try again in a few minutes.`,
                  )
                : i18n._(
                    msg`No apps are available right now. Check back soon.`,
                  )}
            </Body>
          </EmptyState>
        ) : (
          <div>
            <FilterBar
              ariaLabel={i18n._(msg`Filter apps`)}
              facets={facets}
              onClearAll={clearAll}
              onToggle={toggle}
              resultCount={resultCount}
            />
            <Results>
              {visibleApps.length === 0 ? (
                <FilterEmptyState
                  onClearAll={clearAll}
                  title={i18n._(msg`No apps match your filters`)}
                />
              ) : (
                <AppCards apps={visibleApps} />
              )}
            </Results>
          </div>
        )}
      </SectionStack>
    </SectionShell>
  );
}
