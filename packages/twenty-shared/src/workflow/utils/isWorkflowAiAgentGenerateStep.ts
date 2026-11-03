import { isNonEmptyString } from '@sniptt/guards';
import { type z } from 'zod';

import { type workflowAiAgentActionSettingsSchema } from '@/workflow/schemas/ai-agent-action-settings-schema';

// without an agent, the step is a single generation run as the caller: no conversation, no human input
export const isWorkflowAiAgentGenerateStep = (
  input: Pick<
    z.infer<typeof workflowAiAgentActionSettingsSchema>['input'],
    'agentId'
  >,
): boolean => !isNonEmptyString(input.agentId);
