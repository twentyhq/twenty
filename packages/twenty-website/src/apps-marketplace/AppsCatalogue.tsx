'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { MENU_HEIGHT_PX, radius, semanticColor, spacing } from '@/tokens';
import {
  Body,
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
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
          <AppCards apps={ordered} />
        )}
      </SectionStack>
    </SectionShell>
  );
}
