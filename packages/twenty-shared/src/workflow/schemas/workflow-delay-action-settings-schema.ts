import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowDelayActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      delayType: z.enum(['schedule_date', 'duration']),
      scheduledDateTime: z.string().nullable().optional(),
      duration: z.object({
        days: z.number(),
        hours: z.number(),
        minutes: z.number(),
        seconds: z.number(),
      }).optional(),
    }),
  });
