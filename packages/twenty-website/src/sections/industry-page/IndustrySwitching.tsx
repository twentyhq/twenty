import { msg } from '@lingui/core/macro';

import {
  getIndustryObjectLabel,
  type ResolvedIndustryPage,
} from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Body, SectionShell, SectionStack } from '@/ui';

import { IndustryPointGrid } from './IndustryPointGrid';
import { IndustrySectionIntro } from './IndustrySectionIntro';

type IndustrySwitchingProps = {
  page: ResolvedIndustryPage;
};

export function IndustrySwitching({ page }: IndustrySwitchingProps) {
  const i18n = getServerI18n();
  const labelFor = (objectId: string): string => {
    const label = getIndustryObjectLabel(page, objectId);
    return label ? i18n._(label) : objectId;
  };

  return (
    <SectionShell scheme="light">
      <SectionStack>
        <IndustrySectionIntro
          heading={msg`Your Salesforce objects, *mapped to your model*`}
          sectionId="switching"
        />
        <IndustryPointGrid
          columns={4}
          items={page.switching.mappings.map((mapping) => ({
            key: `${mapping.salesforceObject}-${mapping.objectId}`,
            kicker: `${page.switching.salesforceProduct} · ${mapping.salesforceObject}`,
            title: labelFor(mapping.objectId),
            body: i18n._(
              msg`Becomes a Twenty object you can rename and extend.`,
            ),
          }))}
        />
        <Body muted size="sm">
          {i18n._(page.switching.note)}
        </Body>
      </SectionStack>
    </SectionShell>
  );
}
