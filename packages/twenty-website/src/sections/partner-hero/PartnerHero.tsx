import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { BecomePartnerButton } from '@/partner-application';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  fontFamily,
  GRADIENT,
  HERO_COMPOSITION,
  mediaUp,
  semanticColor,
  spacing,
  typeRampDeclarations,
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

// The hero's single CTA sits on the shared 32px Body->CTA step (IntroStack's
// owl rhythm); the buyer hand-off hangs 12px under it so it reads as a
// footnote to the CTA rather than as a second step in that rhythm.
const CtaStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

// Deliberately duplicated from partner-lead/PartnerBecomeStrip's LearnMoreLink:
// sections may not import each other, so the recipe is copied, not shared.
const HireLink = styled(LocalizedLink)`
  color: ${semanticColor.inkMuted};
  display: inline-block;
  font-family: ${fontFamily('sans')};
  text-decoration: underline;
  text-underline-offset: 2px;
  ${typeRampDeclarations('bodySm')}

  &:hover {
    color: ${semanticColor.ink};
  }
`;

const VisualStage = styled.div`
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  width: 100%;
`;

export function PartnerHero() {
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
              {i18n._(msg`Become a\n*Twenty integrator*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`You implement Twenty for your clients. Earn 20% on every client you bring, get help from our team and other partners, and grow into a Lead Integrator to receive client briefs.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <CtaStack>
          <BecomePartnerButton label={msg`Apply as an integrator`} />
          <HireLink href="/partners">
            {i18n._(msg`Looking to hire a partner?`)}
          </HireLink>
        </CtaStack>
      </IntroStack>
      <VisualStage>
        <PartnerVisual />
      </VisualStage>
    </SectionShell>
  );
}
