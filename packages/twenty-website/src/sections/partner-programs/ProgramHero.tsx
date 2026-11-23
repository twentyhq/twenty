import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { GRADIENT, HERO_COMPOSITION, spacing } from '@/tokens';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { Body, Heading, HeadingPair, SectionShell } from '@/ui';

// WhyTwentyHero's composition: centered intro, actions, then the visual.
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

// HomeHero's app-window height for every program hero, so integrators and
// creators match whether they show an object or a full-bleed backdrop.
const VisualStage = styled.div`
  height: ${APP_PREVIEW_STAGE.windowScene.heightPx}px;
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  width: 100%;
`;

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

const HeadingMeasure = styled.div`
  max-width: 672px;
  width: 100%;
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 443px;
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

type ProgramHeroProps = {
  heading: MessageDescriptor;
  body: MessageDescriptor;
  actions: ReactNode;
  backdrop?: ReactNode;
  visual?: ReactNode;
};

export function ProgramHero({
  heading,
  body,
  actions,
  backdrop,
  visual,
}: ProgramHeroProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={
        isDefined(backdrop) ? (
          <>
            <GradientBackdrop />
            {backdrop}
          </>
        ) : undefined
      }
      fullBleedBackground
      rhythm="hero"
      scheme="muted"
    >
      <IntroStack data-halftone-exclude="">
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(heading)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(body)}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <CtaRow>{actions}</CtaRow>
      </IntroStack>
      <VisualStage>{visual}</VisualStage>
    </SectionShell>
  );
}
