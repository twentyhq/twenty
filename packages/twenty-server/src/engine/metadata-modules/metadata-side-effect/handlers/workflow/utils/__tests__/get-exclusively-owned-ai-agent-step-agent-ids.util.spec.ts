import { WorkflowActionType } from 'twenty-shared/workflow';

import { getExclusivelyOwnedAiAgentStepAgentIds } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/get-exclusively-owned-ai-agent-step-agent-ids.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildAiAgentStep = (agentId: string | undefined) =>
  ({
    id: `agent-step-${agentId}`,
    name: 'Agent',
    type: WorkflowActionType.AI_AGENT,
    valid: true,
    nextStepIds: [],
    settings: { input: { agentId, prompt: '' } },
  }) as unknown as WorkflowAction;

describe('getExclusivelyOwnedAiAgentStepAgentIds', () => {
  it('returns the agents of the deleted AI_AGENT steps that no remaining version uses', () => {
    expect(
      getExclusivelyOwnedAiAgentStepAgentIds({
        deletedWorkflowVersions: [
          {
            steps: [
              buildAiAgentStep('owned-agent'),
              buildAiAgentStep('shared-agent'),
            ],
          },
          { steps: [buildAiAgentStep('owned-agent')] },
        ],
        remainingWorkflowVersions: [
          { steps: [buildAiAgentStep('shared-agent')] },
        ],
      }),
    ).toEqual(['owned-agent']);
  });

  it('ignores steps without an agent and versions without steps', () => {
    expect(
      getExclusivelyOwnedAiAgentStepAgentIds({
        deletedWorkflowVersions: [
          { steps: null },
          { steps: [buildAiAgentStep(undefined)] },
        ],
        remainingWorkflowVersions: [{ steps: null }],
      }),
    ).toEqual([]);
  });
});
