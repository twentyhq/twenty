import { type z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';
import { type workflowAiAgentActionSettingsSchema } from '@/workflow/schemas/ai-agent-action-settings-schema';

// the step's own config, which a step running a reusable agent must leave to the agent
export const hasWorkflowAiAgentInlineConfig = (
  input: Pick<
    z.infer<typeof workflowAiAgentActionSettingsSchema>['input'],
    'instructions' | 'modelId' | 'modelConfiguration' | 'scope'
  >,
): boolean =>
  isDefined(input.instructions) ||
  isDefined(input.modelId) ||
  isDefined(input.modelConfiguration) ||
  isDefined(input.scope);
