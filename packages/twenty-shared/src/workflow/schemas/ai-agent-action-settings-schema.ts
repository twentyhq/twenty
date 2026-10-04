import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowAiAgentActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      agentId: z.string().optional(),
      prompt: z.string().optional(),
      // Empty by default: stopping for a person pauses the run, which existing workflows were not built to expect.
      humanInputInstructions: z.string().optional(),
    }),
  });
