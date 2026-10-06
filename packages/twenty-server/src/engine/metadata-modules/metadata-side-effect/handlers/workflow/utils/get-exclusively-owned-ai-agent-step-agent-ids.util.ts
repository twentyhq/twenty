import { isNonEmptyString } from '@sniptt/guards';

import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { isWorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/guards/is-workflow-ai-agent-action.guard';

type WorkflowVersionSteps = Pick<FlatWorkflowVersion, 'steps'>;

const getAiAgentStepAgentIds = (
  workflowVersions: WorkflowVersionSteps[],
): string[] =>
  workflowVersions
    .flatMap(({ steps }) => (steps ?? []).filter(isWorkflowAiAgentAction))
    .map((step) => step.settings.input.agentId)
    .filter(isNonEmptyString);

export const getExclusivelyOwnedAiAgentStepAgentIds = ({
  deletedWorkflowVersions,
  remainingWorkflowVersions,
}: {
  deletedWorkflowVersions: WorkflowVersionSteps[];
  remainingWorkflowVersions: WorkflowVersionSteps[];
}): string[] => {
  const stillReferencedAgentIds = new Set(
    getAiAgentStepAgentIds(remainingWorkflowVersions),
  );

  return [...new Set(getAiAgentStepAgentIds(deletedWorkflowVersions))].filter(
    (agentId) => !stillReferencedAgentIds.has(agentId),
  );
};
