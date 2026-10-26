import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { buildFaqPageJsonLd } from '@/platform/seo/build-faq-page-json-ld';
import { JsonLd } from '@/platform/seo/JsonLd';
import { mediaUp } from '@/tokens';
import {
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { FaqBackdrop } from './FaqBackdrop';
import { FaqItems } from './FaqItems';
import { SLACK_APP_FAQ_QUESTIONS } from './slack-app-faq.data';

const HeadingMeasure = styled.div`
  ${mediaUp('md')} {
    max-width: 700px;
  }
`;

export function SlackAppFaq() {
  const i18n = getServerI18n();

  return (
    <SectionShell background={<FaqBackdrop />} rhythm="spacious" scheme="dark">
      <JsonLd data={buildFaqPageJsonLd(i18n, SLACK_APP_FAQ_QUESTIONS)} />
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Questions`)}</Eyebrow>
          <HeadingMeasure>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Using Twenty *in Slack*`)}
            </Heading>
          </HeadingMeasure>
        </SectionIntro>
        <FaqItems questions={SLACK_APP_FAQ_QUESTIONS} />
      </SectionStack>
    </SectionShell>
  );
}
