import { msg } from '@lingui/core/macro';

import { FaqBackdrop } from './faq-backdrop';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SITE_URLS } from '@/platform/site-urls';
import { buildFaqPageJsonLd } from '@/platform/seo/build-faq-page-json-ld';
import { JsonLd } from '@/platform/seo/json-ld';
import { mediaUp, spacing } from '@/tokens';
import {
  Button,
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { FAQ_QUESTIONS } from './faq.data';
import { FaqItems } from './faq-items';

const HeadingMeasure = styled.div`
  ${mediaUp('md')} {
    max-width: 700px;
  }
`;

const CtaRow = styled.div`
  column-gap: ${spacing(2)};
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  row-gap: ${spacing(2)};
`;

export function Faq() {
  const i18n = getServerI18n();

  return (
    <SectionShell background={<FaqBackdrop />} rhythm="spacious" scheme="dark">
      <JsonLd data={buildFaqPageJsonLd(i18n, FAQ_QUESTIONS)} />
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Any Questions?`)}</Eyebrow>
          <HeadingMeasure>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Stop fighting custom. *Start building, with Twenty*`)}
            </Heading>
          </HeadingMeasure>
          <CtaRow>
            <Button
              href={SITE_URLS.appWelcome}
              label={i18n._(msg`Get started`)}
            />
            <Button
              href={SITE_URLS.calBooking}
              label={i18n._(msg`Talk to us`)}
              variant="outlined"
            />
          </CtaRow>
        </SectionIntro>
        <FaqItems questions={FAQ_QUESTIONS} />
      </SectionStack>
    </SectionShell>
  );
}
