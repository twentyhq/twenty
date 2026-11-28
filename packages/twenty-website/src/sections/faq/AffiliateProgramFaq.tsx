import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { buildFaqPageJsonLd } from '@/platform/seo/build-faq-page-json-ld';
import { JsonLd } from '@/platform/seo/JsonLd';
import { mediaUp, spacing } from '@/tokens';
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

// The home Faq's button row.
const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
  justify-content: flex-start;
`;

type AffiliateProgramFaqProps = {
  actions: ReactNode;
};

export function AffiliateProgramFaq({ actions }: AffiliateProgramFaqProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell background={<FaqBackdrop />} rhythm="spacious" scheme="dark">
      <JsonLd
        data={buildFaqPageJsonLd(i18n, AFFILIATE_PROGRAM_FAQ_QUESTIONS)}
      />
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Questions`)}</Eyebrow>
          <HeadingMeasure>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Becoming *a Twenty creator*`)}
            </Heading>
          </HeadingMeasure>
          <CtaRow>{actions}</CtaRow>
        </SectionIntro>
        <FaqItems questions={AFFILIATE_PROGRAM_FAQ_QUESTIONS} />
      </SectionStack>
    </SectionShell>
  );
}
