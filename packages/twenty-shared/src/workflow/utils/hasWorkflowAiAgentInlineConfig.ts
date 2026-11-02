import { isNonEmptyString, isString } from '@sniptt/guards';
import { type z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';
import { workflowAiAgentInlineConfigSchema } from '@/workflow/schemas/ai-agent-inline-config-schema';

// blank strings are what the builder stores when unset
export const hasWorkflowAiAgentInlineConfig = (
  input: z.infer<typeof workflowAiAgentInlineConfigSchema>,
): boolean =>
  workflowAiAgentInlineConfigSchema.keyof().options.some((key) => {
    const value = input[key];

    return isString(value) ? isNonEmptyString(value.trim()) : isDefined(value);
  });
