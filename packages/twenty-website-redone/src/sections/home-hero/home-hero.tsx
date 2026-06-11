import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SITE_URLS } from '@/platform/site-urls';
import { spacing } from '@/tokens';
import { Body, Button, Heading, HeadingPair, SectionShell } from '@/ui';

// Pure-CSS glow behind the hero; the halftone visual that renders inside it
// arrives with the visual-runtime port.
const GradientBackdrop = styled.div`
  background: radial-gradient(
    ellipse 80% 60% at 50% 40%,
    rgba(245, 243, 240, 0.6) 0%,
    transparent 70%
  );
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
  max-width: 591px;
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
      background={<GradientBackdrop />}
      rhythm="hero"
      scheme="muted"
    >
      <IntroStack>
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
    </SectionShell>
  );
}
