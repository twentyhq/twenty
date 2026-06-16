import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Body, Eyebrow, Heading, HeadingPair, SectionShell } from '@/ui';

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

export function EnterpriseActivateHero() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="hero" scheme="muted">
      <IntroStack>
        <Eyebrow>{i18n._(msg`Self-hosting`)}</Eyebrow>
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Enterprise *activation*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Your checkout is complete. Follow the steps below to copy your license key into your Twenty instance.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
      </IntroStack>
    </SectionShell>
  );
}
