import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowAiAgentActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      agentId: z.string().optional(),
      prompt: z.string().optional(),
      // Off by default: an agent that can ask pauses its run until someone
      // answers, which existing workflows were not built to expect.
      canAskQuestions: z.boolean().optional(),
    }),
  });
