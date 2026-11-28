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

import { FaqBackdrop } from './FaqBackdrop';
import { FaqItems } from './FaqItems';
import { PARTNER_FAQ_QUESTIONS } from './partner-faq.data';

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

type PartnerFaqProps = {
  actions: ReactNode;
};

export function PartnerFaq({ actions }: PartnerFaqProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell background={<FaqBackdrop />} rhythm="spacious" scheme="dark">
      <JsonLd data={buildFaqPageJsonLd(i18n, PARTNER_FAQ_QUESTIONS)} />
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Questions`)}</Eyebrow>
          <HeadingMeasure>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Working with *a Twenty partner*`)}
            </Heading>
          </HeadingMeasure>
          <CtaRow>{actions}</CtaRow>
        </SectionIntro>
        <FaqItems questions={PARTNER_FAQ_QUESTIONS} />
      </SectionStack>
    </SectionShell>
  );
}
