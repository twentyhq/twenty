import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { buildFaqPageJsonLd } from '@/platform/seo/build-faq-page-json-ld';
import { JsonLd } from '@/platform/seo/JsonLd';
import { Eyebrow, Heading, SectionIntro, SectionShell } from '@/ui';

import { CREATOR_FAQ_QUESTIONS } from './creator-faq.data';
import { CreatorColumns } from './CreatorColumns';
import { CreatorFaqItems } from './CreatorFaqItems';

// PROTOTYPE the affiliate FAQ, title left and questions right.
export function CreatorFaq() {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm rhythm="section" scheme="dark">
      <JsonLd data={buildFaqPageJsonLd(i18n, CREATOR_FAQ_QUESTIONS)} />
      <CreatorColumns>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Questions`)}</Eyebrow>
          <Heading as="h2" size="md" weight="light">
            {i18n._(msg`Becoming *a Twenty creator*`)}
          </Heading>
        </SectionIntro>
        <CreatorFaqItems />
      </CreatorColumns>
    </SectionShell>
  );
}
