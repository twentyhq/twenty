import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { GRADIENT, HERO_COMPOSITION, mediaUp, spacing } from '@/tokens';
import { Body, Heading, HeadingPair, SectionShell } from '@/ui';

import { PartnerVisual } from './PartnerVisual';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// The hero reads as one composition on the shared hero rhythm (HomeHero /
// PricingHero): Heading->Body 12px (HeadingPair), Body->CTA 32px, CTA->visual
// 68px (HERO_COMPOSITION). The intro is centered; the halftone stage hangs
// below at that single CTA-to-visual step.
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
    max-width: 672px;
  }
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 360px;

  ${mediaUp('md')} {
    max-width: 500px;
  }
`;

const CtaRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  justify-content: center;

  ${mediaUp('sm')} {
    flex-direction: row;
  }
`;

const VisualStage = styled.div`
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  width: 100%;
`;

type PartnerHeroProps = {
  heading: MessageDescriptor;
  body: MessageDescriptor;
  actions: ReactNode;
  visualImageUrl?: string;
};

// Program pages (integrators, creators) share the /partners hero composition.
export function PartnerHero({
  heading,
  body,
  actions,
  visualImageUrl,
}: PartnerHeroProps) {
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
      <VisualStage>
        <PartnerVisual imageUrl={visualImageUrl} />
      </VisualStage>
    </SectionShell>
  );
}
