import { msg } from '@lingui/core/macro';

import {
  type IndustryRelatedPage,
  type ResolvedIndustryPage,
} from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SectionShell, SectionStack } from '@/ui';

import { IndustryPointGrid } from './IndustryPointGrid';
import { IndustrySectionIntro } from './IndustrySectionIntro';

type IndustryRelatedProps = {
  page: ResolvedIndustryPage;
  relatedPages: readonly IndustryRelatedPage[];
};

export function IndustryRelated({ page, relatedPages }: IndustryRelatedProps) {
  const i18n = getServerI18n();
  if (relatedPages.length === 0) {
    return null;
  }

  const parentName = page.parent ? i18n._(page.parent.name) : undefined;

  return (
    <SectionShell scheme="muted">
      <SectionStack>
        <IndustrySectionIntro
          heading={
            parentName
              ? msg`More in *${parentName}*`
              : msg`Find the page that *sounds like your business*`
          }
          sectionId="related"
        />
        <IndustryPointGrid
          columns={relatedPages.length > 3 ? 4 : 3}
          items={relatedPages.map((relatedPage) => ({
            key: relatedPage.slug,
            href: `/solutions/${relatedPage.slug}`,
            title: i18n._(relatedPage.name),
            body: i18n._(relatedPage.summary),
          }))}
        />
      </SectionStack>
    </SectionShell>
  );
}
