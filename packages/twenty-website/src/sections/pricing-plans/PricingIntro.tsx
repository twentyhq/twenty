import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp } from '@/tokens';
import { Body, Heading, HeadingPair } from '@/ui';

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

// The pricing headline and subhead — the single home of the heading and
// body measures, server-rendered so the heading notation and the locale
// breaks resolve on the server.
export function PricingIntro() {
  const i18n = getServerI18n();

  return (
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
  );
}
