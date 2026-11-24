import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { type ResolvedIndustryPage } from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { fontFamily, fontSize, radius, semanticColor, spacing } from '@/tokens';
import { SectionShell, SectionStack } from '@/ui';

import { IndustryPointGrid } from './IndustryPointGrid';
import { IndustrySectionIntro } from './IndustrySectionIntro';

const StepList = styled.ol`
  list-style: none;
  padding: 0;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Step = styled.li`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: grid;
  padding: ${spacing(2)} ${spacing(3)};

  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

const StepKind = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const STEP_KIND_LABELS = {
  trigger: msg`Trigger`,
  action: msg`Action`,
  agent: msg`AI agent`,
};

type IndustryWorkflowsProps = {
  page: ResolvedIndustryPage;
};

export function IndustryWorkflows({ page }: IndustryWorkflowsProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="muted">
      <SectionStack>
        <IndustrySectionIntro
          heading={page.workflows.heading}
          sectionId="workflows"
        />
        <IndustryPointGrid
          items={page.workflows.items.map((workflow) => ({
            key: workflow.title.id,
            title: i18n._(workflow.title),
            body: i18n._(workflow.outcome),
            detail: (
              <StepList>
                {workflow.steps.map((step) => (
                  <Step key={step.label.id}>
                    <StepKind>{i18n._(STEP_KIND_LABELS[step.kind])}</StepKind>
                    <span>{i18n._(step.label)}</span>
                  </Step>
                ))}
              </StepList>
            ),
          }))}
        />
      </SectionStack>
    </SectionShell>
  );
}
