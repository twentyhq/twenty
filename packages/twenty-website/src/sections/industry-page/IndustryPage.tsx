import {
  buildIndustryPreviewConfig,
  type IndustryRelatedPage,
  type ResolvedIndustryPage,
} from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';

import { IndustryAccess } from './IndustryAccess';
import { IndustryAgents } from './IndustryAgents';
import { IndustryDataModel } from './IndustryDataModel';
import { IndustryDiscovery } from './IndustryDiscovery';
import { IndustryHero } from './IndustryHero';
import { IndustryPains } from './IndustryPains';
import { IndustryProof } from './IndustryProof';
import { IndustryQuestions } from './IndustryQuestions';
import { IndustryRelated } from './IndustryRelated';
import { IndustrySignoff } from './IndustrySignoff';
import { IndustrySwitching } from './IndustrySwitching';
import { IndustryWorkflows } from './IndustryWorkflows';

type IndustryPageProps = {
  page: ResolvedIndustryPage;
  relatedPages: readonly IndustryRelatedPage[];
};

// The section order is the framework: pages supply data, never layout.
export function IndustryPage({ page, relatedPages }: IndustryPageProps) {
  const previewConfig = buildIndustryPreviewConfig(page, getServerI18n());

  return (
    <>
      <IndustryHero page={page} previewConfig={previewConfig} />
      <IndustryPains page={page} />
      <IndustryDataModel page={page} />
      <IndustryWorkflows page={page} />
      <IndustryAgents page={page} />
      <IndustryAccess page={page} />
      <IndustrySwitching page={page} />
      <IndustryProof page={page} />
      <IndustryQuestions page={page} />
      <IndustryDiscovery page={page} />
      <IndustryRelated page={page} relatedPages={relatedPages} />
      <IndustrySignoff />
    </>
  );
}
