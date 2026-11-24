import { msg } from '@lingui/core/macro';

import { type ResolvedIndustryPage } from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SectionShell, SectionStack } from '@/ui';

import { INDUSTRY_SECTION_EYEBROWS } from './industry-section-eyebrows';
import { IndustryPointGrid } from './IndustryPointGrid';
import { IndustrySectionIntro } from './IndustrySectionIntro';

type IndustryPainsProps = {
  page: ResolvedIndustryPage;
};

export function IndustryPains({ page }: IndustryPainsProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="light">
      <SectionStack>
        <IndustrySectionIntro
          heading={msg`Generic CRMs were built for *someone else's business*`}
          sectionId="pains"
        />
        <IndustryPointGrid
          columns={4}
          items={page.pains.map((pain) => ({
            key: pain.complaint.id,
            kicker: i18n._(INDUSTRY_SECTION_EYEBROWS[pain.answeredBy]),
            title: `“${i18n._(pain.complaint)}”`,
            body: i18n._(pain.answer),
          }))}
        />
      </SectionStack>
    </SectionShell>
  );
}
