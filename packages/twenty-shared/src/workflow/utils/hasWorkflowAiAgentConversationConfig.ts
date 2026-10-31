import { isNonEmptyString } from '@sniptt/guards';
import { type z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';
import { type workflowAiAgentActionSettingsSchema } from '@/workflow/schemas/ai-agent-action-settings-schema';

// only a step running a reusable agent holds a conversation; blank instructions are what the builder stores when unset
export const hasWorkflowAiAgentConversationConfig = (
  input: Pick<
    z.infer<typeof workflowAiAgentActionSettingsSchema>['input'],
    'humanInputInstructions' | 'conversation'
  >,
): boolean =>
  isNonEmptyString(input.humanInputInstructions?.trim()) ||
  isDefined(input.conversation);
