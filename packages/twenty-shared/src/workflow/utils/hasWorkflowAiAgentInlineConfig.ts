import { type z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';
import { workflowAiAgentInlineConfigSchema } from '@/workflow/schemas/ai-agent-inline-config-schema';

export const hasWorkflowAiAgentInlineConfig = (
  input: z.infer<typeof workflowAiAgentInlineConfigSchema>,
): boolean =>
  workflowAiAgentInlineConfigSchema
    .keyof()
    .options.some((key) => isDefined(input[key]));
