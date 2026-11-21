'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { containerColumnDeclarations, mediaUp, spacing } from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { AppsStageAppCards } from './AppsStageAppCards';
import { type MarketplaceApp } from './marketplace-app';

// Hand-picked by the team, matched on the app name.
const FEATURED_APP_NAMES: readonly string[] = [
  'slack',
  'granola',
  'microsoft teams',
];

const Frame = styled.div`
  padding-block: ${spacing(12)};
  ${containerColumnDeclarations()}

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    padding-block: ${spacing(20)};
  }
`;

const Header = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

type AppsStageFeaturedProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsStageFeatured({ apps }: AppsStageFeaturedProps) {
  const { i18n } = useLingui();
  const featured = FEATURED_APP_NAMES.flatMap((name) => {
    const app = apps.find(
      (candidate) => candidate.name.trim().toLowerCase() === name,
    );

    return isDefined(app) ? [app] : [];
  });

  if (featured.length === 0) {
    return null;
  }

  return (
    <SectionShell flushInline rhythm="flush" scheme="dark">
      <Frame>
        <Header>
          <Heading as="h2" size="sm" weight="light">
            {i18n._(msg`Featured apps`)}
          </Heading>
          <Body muted size="sm">
            {i18n._(msg`Picked by the Twenty team.`)}
          </Body>
        </Header>
        <AppsStageAppCards apps={featured} hasLiveLogos />
      </Frame>
    </SectionShell>
  );
}
