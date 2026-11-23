'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { type ReactNode } from 'react';

import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import { HERO_COMPOSITION, spacing } from '@/tokens';
import { Body, GuideCrosshair, Heading, HeadingPair, SectionShell } from '@/ui';

import { GLOBE_MODEL_SETTINGS } from './globe-model-settings';

// A real world in 3D (public/models/partners-globe.glb, the land raised on
// a sphere), drawn by the site's halftone engine.
const GLOBE_MODEL_URL = '/models/partners-globe.glb';

const GlobeBox = styled.div`
  aspect-ratio: 1;
  margin-inline: auto;
  max-width: 640px;
  width: 100%;
`;

// HomeHero's app-window height at every width, so every hero ends at the same line.
const GlobeStage = styled.div`
  align-items: center;
  display: flex;
  height: ${APP_PREVIEW_STAGE.windowScene.heightPx}px;
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
`;

// The home hero's text block: HeadingPair, the same measures, 32px to the
// actions.
const Copy = styled.div`
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

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

type PartnersHeroProps = {
  actions: ReactNode;
};

export function PartnersHero({ actions }: PartnersHeroProps) {
  const { i18n } = useLingui();
  return (
    <SectionShell
      background={
        // The hero closes on a hairline with the + under the globe.
        <GuideCrosshair
          crossX="50%"
          crossY="calc(100% - 1px)"
          verticalLines={false}
        />
      }
      rhythm="hero"
      scheme="dark"
    >
      <Copy>
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Hire the people who *build on Twenty*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Certified partners who set up your CRM to match how your company works, from the migration to the custom apps.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <Actions>{actions}</Actions>
      </Copy>
      <GlobeStage>
        <GlobeBox aria-hidden>
          <HalftoneModel
            modelUrl={GLOBE_MODEL_URL}
            settings={GLOBE_MODEL_SETTINGS}
          />
        </GlobeBox>
      </GlobeStage>
    </SectionShell>
  );
}
