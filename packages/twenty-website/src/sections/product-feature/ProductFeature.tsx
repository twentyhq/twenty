import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { spacing } from '@/tokens';
import {
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { Tiles } from './components/Tiles';
import { FEATURE_TILES } from './data/feature-tiles';

const IntroMeasure = styled.div`
  margin-inline: auto;
  max-width: 688px;
  text-align: center;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

export function ProductFeature() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="light">
      <SectionStack>
        <SectionIntro>
          <IntroMeasure>
            <Eyebrow>{i18n._(msg`Core Features`)}</Eyebrow>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Everything you need, *out of the box*`)}
            </Heading>
          </IntroMeasure>
        </SectionIntro>
        <Tiles tiles={FEATURE_TILES} />
      </SectionStack>
    </SectionShell>
  );
}
