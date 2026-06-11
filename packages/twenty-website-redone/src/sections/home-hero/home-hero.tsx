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
/* The app window is LIFE-SIZE at every viewport (measured on old at five
   widths: fixed 1040x676, centered when it fits, anchored 16px left and
   bleeding off the right edge when it does not — the Linear-class
   presentation; the viewport crops the app, the app never shrinks).
   max() keeps that behavior continuous, no breakpoint. The 68px top gap
   is the old CTA-to-window measure; drag/resize arrives with commit 6. */
const MockupStage = styled.div`
  height: ${APP_PREVIEW_STAGE.windowScene.heightPx}px;
  /* 0px floor = the window anchors at the page gutter when it cannot
     center (old measures 40px in the md band, 16px below — exactly the
     gutter), then bleeds off the right. */
  margin-left: max(
    0px,
    calc((100% - ${APP_PREVIEW_STAGE.windowScene.widthPx}px) / 2)
  );
  margin-top: 68px;
  position: relative;
  width: ${APP_PREVIEW_STAGE.windowScene.widthPx}px;
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
