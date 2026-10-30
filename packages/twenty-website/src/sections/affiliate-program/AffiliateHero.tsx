import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { AFFILIATE_APPLY_ANCHOR_ID } from '@/platform/routing/affiliate-apply-anchor-id';
import { GRADIENT, mediaUp, spacing } from '@/tokens';
import {
  Body,
  Button,
  Eyebrow,
  Heading,
  HeadingPair,
  SectionShell,
} from '@/ui';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// Same hero rhythm as PartnerHero: Heading->Body 12px (HeadingPair), then one
// 32px step to every following block.
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
    max-width: 720px;
  }
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 360px;

  ${mediaUp('md')} {
    max-width: 500px;
  }
`;

export function AffiliateHero() {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={<GradientBackdrop />}
      rhythm="hero"
      scheme="light"
    >
      <IntroStack>
        <Eyebrow>{i18n._(msg`Twenty affiliate program`)}</Eyebrow>
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Earn 20% on every team\n*you bring to Twenty*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Recommend the CRM technical teams build at AI speed. Get paid every month, for a year, on each new customer.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <Button
          href={`#${AFFILIATE_APPLY_ANCHOR_ID}`}
          label={i18n._(msg`Apply now`)}
        />
      </IntroStack>
    </SectionShell>
  );
}
