import { z } from 'zod';
import { baseTriggerSchema } from './base-trigger-schema';

export const workflowCronTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('CRON'),
  settings: z.object({
    pattern: z
      .string()
      .describe(
        'Cron expression with 5 fields: minute hour day-of-month month day-of-week (e.g., "0 9 * * 1-5" for weekdays at 09:00, "*/15 * * * *" for every 15 minutes).',
      ),
    outputSchema: z.looseObject({}),
  }),
});
