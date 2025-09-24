import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowAiAgentActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      agentId: z.string().optional(),
      prompt: z.string().optional(),
    }),
  });
