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

import { AFFILIATE_PROGRAM_FAQ_QUESTIONS } from './affiliate-program-faq.data';
import { FaqBackdrop } from './FaqBackdrop';
import { FaqItems } from './FaqItems';

const HeadingMeasure = styled.div`
  ${mediaUp('md')} {
    max-width: 700px;
  }
`;

export function AffiliateProgramFaq() {
  const i18n = getServerI18n();

  return (
    <SectionShell background={<FaqBackdrop />} rhythm="spacious" scheme="dark">
      <JsonLd
        data={buildFaqPageJsonLd(i18n, AFFILIATE_PROGRAM_FAQ_QUESTIONS)}
      />
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`FAQ`)}</Eyebrow>
          <HeadingMeasure>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Earning with *Twenty*`)}
            </Heading>
          </HeadingMeasure>
        </SectionIntro>
        <FaqItems questions={AFFILIATE_PROGRAM_FAQ_QUESTIONS} />
      </SectionStack>
    </SectionShell>
  );
}
