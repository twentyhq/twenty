import { type z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';
import { type workflowAiAgentActionSettingsSchema } from '@/workflow/schemas/ai-agent-action-settings-schema';
import { type WorkflowAiAgentStepKind } from '@/workflow/types/WorkflowAiAgentStepKind';
import { isWorkflowAiAgentGenerateStep } from '@/workflow/utils/isWorkflowAiAgentGenerateStep';
import { isWorkflowStepOwnedAgent } from '@/workflow/utils/isWorkflowStepOwnedAgent';

// an agent that cannot be found is treated as reusable, since only a loaded agent can tell it belongs to the step
export const getWorkflowAiAgentStepKind = (
  input: Pick<
    z.infer<typeof workflowAiAgentActionSettingsSchema>['input'],
    'agentId'
  >,
  agent?: { isSystem: boolean } | null,
): WorkflowAiAgentStepKind => {
  if (isWorkflowAiAgentGenerateStep(input)) {
    return 'generate';
  }

  return isDefined(agent) && isWorkflowStepOwnedAgent(agent)
    ? 'stepOwnedAgent'
    : 'agent';
};
