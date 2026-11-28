import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  GRADIENT,
  HERO_COMPOSITION,
  mediaUp,
  MENU_HEIGHT_PX,
  RHYTHM,
  spacing,
} from '@/tokens';
import { Body, Heading, HeadingPair, SectionShell } from '@/ui';

// WhyTwentyHero's composition: centered intro, actions, then the visual.
const IntroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(HERO_COMPOSITION.introGapSpacing)};
  }
`;

// WhyTwentyHero's stage: the visual sets its own height, so the hero ends
// with it and the illustration shows on arrival on large screens.
const VisualStage = styled.div`
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  width: 100%;
`;

// Without a visual, the room under the actions for the backdrop's banner:
// the gap down to the visual, then the banner itself, as a visual would
// take. The banner shrinks with the width, so the room does too; at desktop
// it is the shared height (belowActionsPx).
const BackdropRoom = styled.div`
  height: calc(
    ${HERO_COMPOSITION.ctaToVisualGapPx}px +
      ${HERO_COMPOSITION.visualBannerHeight} -
      ${spacing(RHYTHM.hero.bottom.base)}
  );

  ${mediaUp('md')} {
    height: calc(
      ${HERO_COMPOSITION.ctaToVisualGapPx}px +
        ${HERO_COMPOSITION.visualBannerHeight} -
        ${spacing(RHYTHM.hero.bottom.md)}
    );
  }
`;

// A hero whose backdrop runs up under the menu: it starts behind the menu
// and keeps its copy where it was.
const UnderMenu = styled.div`
  margin-top: -${MENU_HEIGHT_PX}px;

  & > section[data-rhythm] {
    padding-top: calc(${spacing(RHYTHM.hero.top.base)} + ${MENU_HEIGHT_PX}px);

    ${mediaUp('md')} {
      padding-top: calc(${spacing(RHYTHM.hero.top.md)} + ${MENU_HEIGHT_PX}px);
    }
  }
`;

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

const HeadingMeasure = styled.div`
  max-width: ${HERO_COMPOSITION.headingMeasurePx}px;
  width: 100%;
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: ${HERO_COMPOSITION.bodyMeasurePx}px;
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
  scheme?: 'light' | 'muted';
  underMenu?: boolean;
};

export function ProgramHero({
  heading,
  body,
  actions,
  backdrop,
  visual,
  scheme = 'muted',
  underMenu = false,
}: ProgramHeroProps) {
  const i18n = getServerI18n();

  const hero = (
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
      scheme={scheme}
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
      {isDefined(visual) ? (
        <VisualStage>{visual}</VisualStage>
      ) : (
        isDefined(backdrop) && <BackdropRoom />
      )}
    </SectionShell>
  );

  return underMenu ? <UnderMenu>{hero}</UnderMenu> : hero;
}
