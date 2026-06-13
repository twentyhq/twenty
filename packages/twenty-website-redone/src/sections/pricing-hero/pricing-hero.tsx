import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { GRADIENT, mediaUp, spacing } from '@/tokens';
import { Body, Heading, HeadingPair, SectionShell } from '@/ui';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

const IntroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

/* The old hero hard-breaks "Simple" over "Pricing" and the body after
   "today" — design stacks on SHORT lines live in the message strings
   (locale-controlled breaks; heading notation renders them). */
const HeadingMeasure = styled.div`
  max-width: 360px;
  width: 100%;

  ${mediaUp('md')} {
    max-width: 672px;
  }
`;

const BodyMeasure = styled.div`
  white-space: pre-line;

  ${mediaUp('md')} {
    max-width: 500px;
  }
`;

export function PricingHero() {
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
              {i18n._(msg`Simple\n*Pricing*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(msg`Start your free trial today\nwithout credit card.`)}
            </Body>
          </BodyMeasure>
        </HeadingPair>
      </IntroStack>
    </SectionShell>
  );
}
