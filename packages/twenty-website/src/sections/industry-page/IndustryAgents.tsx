import { msg } from '@lingui/core/macro';

import {
  getIndustryObjectLabel,
  type ResolvedIndustryPage,
} from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Body, SectionShell, SectionStack } from '@/ui';

import { IndustryPointGrid } from './IndustryPointGrid';
import { IndustrySectionIntro } from './IndustrySectionIntro';

type IndustryAgentsProps = {
  page: ResolvedIndustryPage;
};

// Agents and the custom screen share one section: both are the parts of
// the page a packaged CRM cannot show for this industry.
export function IndustryAgents({ page }: IndustryAgentsProps) {
  const i18n = getServerI18n();
  const formatObjects = (objectIds: readonly string[]): string =>
    objectIds
      .map((objectId) => {
        const label = getIndustryObjectLabel(page, objectId);
        return label ? i18n._(label) : objectId;
      })
      .join(', ');
  const placedOn = getIndustryObjectLabel(page, page.customScreen.placedOn);
  const placedOnLabel = placedOn ? i18n._(placedOn) : undefined;

  return (
    <SectionShell scheme="light">
      <SectionStack>
        <IndustrySectionIntro
          heading={page.agents.heading}
          sectionId="agents"
        />
        <IndustryPointGrid
          items={page.agents.items.map((agent) => ({
            key: agent.name.id,
            kicker: i18n._(msg`AI agent`),
            title: i18n._(agent.name),
            body: i18n._(agent.job),
            detail: (
              <Body muted size="xs">
                {[
                  i18n._(msg`Reads ${formatObjects(agent.reads)}`),
                  i18n._(msg`Writes ${formatObjects(agent.writes)}`),
                  i18n._(agent.limit),
                ].join(' · ')}
              </Body>
            ),
          }))}
        />
        <IndustryPointGrid
          columns={2}
          items={[
            {
              key: page.customScreen.title.id,
              kicker: placedOnLabel
                ? i18n._(msg`Custom screen on ${placedOnLabel}`)
                : i18n._(msg`Custom screen`),
              title: i18n._(page.customScreen.title),
              body: i18n._(page.customScreen.description),
            },
          ]}
        />
      </SectionStack>
    </SectionShell>
  );
}
