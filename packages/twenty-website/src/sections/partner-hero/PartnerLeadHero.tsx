import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  fontFamily,
  fontSize,
  GRADIENT,
  HERO_COMPOSITION,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading, HeadingPair, SectionShell } from '@/ui';

import { LEAD_HERO_STEPS } from './lead-hero-steps.data';
import { LeadHeroCtas } from './LeadHeroCtas';
import { PartnerVisual } from './PartnerVisual';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// Same composition as the recruitment hero: Heading->Body 12px (HeadingPair),
// then a single 32px step down the intro, then the stage at the shared
// CTA-to-visual measure.
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
  max-width: 360px;
  width: 100%;

  ${mediaUp('md')} {
    max-width: 760px;
  }
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 360px;

  ${mediaUp('md')} {
    max-width: 500px;
  }
`;

// The steps close the intro on its own 32px step: a centred stack on small
// screens, one hairline-divided line from md up.
const StepLine = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};

  ${mediaUp('md')} {
    flex-direction: row;
    gap: 0;
    justify-content: center;
  }
`;

const StepItem = styled.span`
  align-items: baseline;
  color: ${semanticColor.ink};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  gap: ${spacing(2)};

  ${mediaUp('md')} {
    padding-inline: ${spacing(6)};

    & + & {
      border-left: 1px solid ${semanticColor.line};
    }
  }
`;

const StepNumber = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3.25)};
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.1em;
`;

const VisualStage = styled.div`
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  width: 100%;
`;

export function PartnerLeadHero() {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={<GradientBackdrop />}
      rhythm="hero"
      scheme="light"
    >
      <IntroStack>
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Tell us what you need, we match you in *48 hours*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Skip the browsing. Describe your project and we connect you with a certified Twenty partner who fits it.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <LeadHeroCtas />
        <StepLine>
          {LEAD_HERO_STEPS.map((step) => (
            <StepItem key={step.number}>
              <StepNumber>{step.number}</StepNumber>
              {i18n._(step.title)}
            </StepItem>
          ))}
        </StepLine>
      </IntroStack>
      <VisualStage>
        <PartnerVisual />
      </VisualStage>
    </SectionShell>
  );
}
