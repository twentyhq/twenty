import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { GRADIENT, mediaUp, spacing } from '@/tokens';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { Body, Button, Heading, HeadingPair, SectionShell } from '@/ui';

import { PartnerVisual } from './partner-visual';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// The hero reads as one composition on the shared hero rhythm (HomeHero /
// PricingHero): Heading->Body 12px (HeadingPair), Body->CTA 32px, CTA->visual
// 68px (the windowScene CTA gap). The intro is centered; the halftone stage
// hangs below at that single CTA-to-visual step.
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
  max-width: 500px;
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

const VisualStage = styled.div`
  margin-top: ${APP_PREVIEW_STAGE.windowScene.ctaGapPx}px;
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
              {i18n._(msg`Become\n*our partner*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`We're building the #1 Open Source CRM, but we can't do it alone. Join our partner ecosystem and grow with us.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <CtaRow>
          <Button label={i18n._(msg`Become a partner`)} />
          <Button
            href="/partners/list"
            label={i18n._(msg`Find a partner`)}
            variant="outlined"
          />
        </CtaRow>
      </IntroStack>
      <VisualStage>
        <PartnerVisual />
      </VisualStage>
    </SectionShell>
  );
}
