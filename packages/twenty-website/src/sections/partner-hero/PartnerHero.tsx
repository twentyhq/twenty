import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  fontFamily,
  GRADIENT,
  HERO_COMPOSITION,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
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

const TitleBlock = styled.div`
  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

const Badge = styled.span`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.inkMuted};
  display: inline-block;
  font-family: ${fontFamily('mono')};
  font-size: 11px;
  letter-spacing: 0.06em;
  line-height: 16px;
  padding: 2px 7px;
  text-transform: uppercase;
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
  badge?: MessageDescriptor;
  actions: ReactNode;
  visualImageUrl?: string;
};

export function PartnerHero({
  heading,
  body,
  badge,
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
        <TitleBlock>
          {isDefined(badge) && (
            <div>
              <Badge>{i18n._(badge)}</Badge>
            </div>
          )}
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
        </TitleBlock>
        <CtaRow>{actions}</CtaRow>
      </IntroStack>
      <VisualStage>
        <PartnerVisual imageUrl={visualImageUrl} />
      </VisualStage>
    </SectionShell>
  );
}
