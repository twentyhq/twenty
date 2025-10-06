import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowDelayActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      delayType: z.enum(['RESUME_AT', 'RESUME_AFTER']),
      scheduledDateTime: z.string().optional(),
      duration: z.object({
        days: z.number().optional(),
        hours: z.number().optional(),
        minutes: z.number().optional(),
      }).optional(),
    }),
  });
