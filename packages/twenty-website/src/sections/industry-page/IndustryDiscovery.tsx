import { msg } from '@lingui/core/macro';

import { type ResolvedIndustryPage } from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SectionShell, SectionStack } from '@/ui';

import { IndustryPointGrid } from './IndustryPointGrid';
import { IndustrySectionIntro } from './IndustrySectionIntro';

type IndustryDiscoveryProps = {
  page: ResolvedIndustryPage;
};

export function IndustryDiscovery({ page }: IndustryDiscoveryProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="light">
      <SectionStack>
        <IndustrySectionIntro
          heading={msg`Five questions that *shape the workspace*`}
          sectionId="discovery"
        />
        <IndustryPointGrid
          columns={3}
          items={page.discovery.map((entry, index) => ({
            key: entry.question.id,
            kicker: String(index + 1).padStart(2, '0'),
            title: i18n._(entry.question),
            body: i18n._(entry.shapes),
          }))}
        />
      </SectionStack>
    </SectionShell>
  );
}
