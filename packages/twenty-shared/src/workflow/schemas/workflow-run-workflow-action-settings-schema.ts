import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowRunWorkflowActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      workflowId: z.uuid(),
      input: z.record(z.string(), z.any()),
    }),
  });
