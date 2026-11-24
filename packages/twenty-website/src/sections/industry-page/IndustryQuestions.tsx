import { msg } from '@lingui/core/macro';

import { type ResolvedIndustryPage } from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { buildFaqPageJsonLd } from '@/platform/seo/build-faq-page-json-ld';
import { JsonLd } from '@/platform/seo/JsonLd';
import { SectionShell, SectionStack } from '@/ui';

import { IndustryPointGrid } from './IndustryPointGrid';
import { IndustrySectionIntro } from './IndustrySectionIntro';

type IndustryQuestionsProps = {
  page: ResolvedIndustryPage;
};

export function IndustryQuestions({ page }: IndustryQuestionsProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="dark">
      <JsonLd data={buildFaqPageJsonLd(i18n, page.questions)} />
      <SectionStack>
        <IndustrySectionIntro
          heading={msg`What teams *ask before switching*`}
          sectionId="questions"
        />
        <IndustryPointGrid
          columns={2}
          items={page.questions.map((entry) => ({
            key: entry.question.id,
            title: i18n._(entry.question),
            body: i18n._(entry.answer),
          }))}
        />
      </SectionStack>
    </SectionShell>
  );
}
