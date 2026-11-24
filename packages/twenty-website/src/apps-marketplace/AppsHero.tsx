'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { SITE_URLS } from '@/platform/site-urls';
import { mediaUp, spacing } from '@/tokens';
import { Body, Button, Heading, HeadingPair, SectionShell } from '@/ui';

import { AppsBackdrop } from './AppsBackdrop';
import { AppsOrbit } from './AppsOrbit';
import { APPS_ORBIT_ROOM } from './apps-orbit-room';
import { type MarketplaceApp } from './marketplace-app';

// The home hero's stack: centred copy, then CTAs, one 32px gap.
const IntroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const HeadingMeasure = styled.div`
  max-width: 672px;
  width: 100%;
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 591px;
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

// Empty: the orbit, drawn in the background layer, turns in this room.
const OrbitRoom = styled.div`
  height: ${APPS_ORBIT_ROOM.base};

  ${mediaUp('md')} {
    height: ${APPS_ORBIT_ROOM.md};
  }
`;

type AppsHeroProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsHero({ apps }: AppsHeroProps) {
  const { i18n } = useLingui();

  return (
    <SectionShell
      background={
        <>
          <AppsBackdrop />
          <AppsOrbit apps={apps} />
        </>
      }
      fullBleedBackground
      rhythm="hero"
      scheme="muted"
    >
      <IntroStack data-apps-stage-copy="">
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Apps for\n*Twenty*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Every app is reviewed by our team for security and quality. Install one in a click, it's live in your workspace.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <CtaRow>
          <Button href="#all-apps" label={i18n._(msg`Browse apps`)} />
          <Button
            href={SITE_URLS.docsDevelopers}
            label={i18n._(msg`Build an app`)}
            variant="outlined"
          />
        </CtaRow>
      </IntroStack>
      <OrbitRoom />
    </SectionShell>
  );
}
