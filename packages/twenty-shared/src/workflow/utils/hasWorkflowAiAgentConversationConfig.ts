import { isNonEmptyString, isString } from '@sniptt/guards';
import { type z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';
import { workflowAiAgentConversationConfigSchema } from '@/workflow/schemas/ai-agent-conversation-config-schema';

// blank instructions are what the builder stores when unset
export const hasWorkflowAiAgentConversationConfig = (
  input: z.infer<typeof workflowAiAgentConversationConfigSchema>,
): boolean =>
  workflowAiAgentConversationConfigSchema.keyof().options.some((key) => {
    const value = input[key];

    return isString(value) ? isNonEmptyString(value.trim()) : isDefined(value);
  });
