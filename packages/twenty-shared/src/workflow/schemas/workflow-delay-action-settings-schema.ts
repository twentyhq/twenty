import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowDelayActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      scheduledDateTime: z.string().nullable().optional(),
    }),
  });
