import { z } from 'zod';

import { aiRunScopeSchema } from '@/ai/schemas/ai-run-scope-schema';
import { modelConfigurationSchema } from '@/ai/schemas/model-configuration-schema';

export const workflowAiAgentInlineConfigSchema = z.object({
  instructions: z.string().optional(),
  // the workspace's default model when unset
  modelId: z.string().optional(),
  modelConfiguration: modelConfigurationSchema.optional(),
  // no data tools when unset
  scope: aiRunScopeSchema.optional(),
});
