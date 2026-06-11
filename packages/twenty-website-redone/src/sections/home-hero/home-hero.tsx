import { msg } from '@lingui/core/macro';

import { AppPreview } from '@/app-preview/app-preview';

import { HeroBackdrop } from './hero-backdrop';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SITE_URLS } from '@/platform/site-urls';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { GRADIENT, spacing } from '@/tokens';
import { Body, Button, Heading, HeadingPair, SectionShell } from '@/ui';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// Deliberately NOT SectionIntro: the centered display hero is its own
// composition class with the authored 32px stack gap (A/B-verified).
const IntroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(8)};
  text-align: center;
  width: 100%;
`;

// Fluid measure: a single cap, approached continuously by the container.
const HeadingMeasure = styled.div`
  max-width: 672px;
  width: 100%;
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 591px;
`;

// Reserves the product mockup's footprint ahead of the DOM landing — CLS
// settles in this commit, and the frame's opaque surface already hides
// the bridge center exactly as the old window does.
const MockupStage = styled.div`
  aspect-ratio: ${APP_PREVIEW_STAGE.frame.aspectRatio};
  margin-inline: auto;
  /* Measured on the old site at 1440: 68px from the CTA row to the window
     top (24px section gap + the preview's own staging) — the real frame
     port restores the mechanism. */
  margin-top: 68px;
  max-width: ${APP_PREVIEW_STAGE.frame.maxWidthPx}px;
  position: relative;
  width: 100%;
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

export function HomeHero() {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={
        <GradientBackdrop>
          <HeroBackdrop />
        </GradientBackdrop>
      }
      rhythm="hero"
      scheme="muted"
    >
      <IntroStack data-halftone-exclude="">
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Build your Enterprise CRM *at AI Speed*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Twenty gives technical teams the building blocks for a custom CRM that meets complex business needs and quickly adapts as the business evolves.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <CtaRow>
          <Button
            href={SITE_URLS.appWelcome}
            label={i18n._(msg`Get started`)}
          />
          <Button
            href={SITE_URLS.calBooking}
            label={i18n._(msg`Talk to us`)}
            variant="outlined"
          />
        </CtaRow>
      </IntroStack>
      <MockupStage data-mockup-stage="">
        <AppPreview />
      </MockupStage>
    </SectionShell>
  );
}
