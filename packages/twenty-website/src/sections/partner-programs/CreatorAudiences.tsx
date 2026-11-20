import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import {
  Eyebrow,
  Heading,
  ModelCardGrid,
  SectionIntro,
  SectionShell,
} from '@/ui';

import { CREATOR_AUDIENCES } from './creator-audiences.data';

const Block = styled.div`
  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    & > * + * {
      margin-top: ${spacing(12)};
    }
  }
`;

const HeadingMeasure = styled.div`
  max-width: 640px;
`;

export function CreatorAudiences() {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm rhythm="section" scheme="dark">
      <Block>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Who it's for`)}</Eyebrow>
          <HeadingMeasure>
            <Heading as="h2" size="md" weight="light">
              {i18n._(msg`People that teams trust *to pick their tools*`)}
            </Heading>
          </HeadingMeasure>
        </SectionIntro>
        <ModelCardGrid
          cards={CREATOR_AUDIENCES.map((audience) => ({
            body: i18n._(audience.body),
            model: audience.model,
            title: i18n._(audience.title),
          }))}
        />
      </Block>
    </SectionShell>
  );
}
