import { z } from 'zod';
import { baseTriggerSchema } from './base-trigger-schema';

export const workflowCronTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('CRON'),
  settings: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('DAYS'),
      schedule: z.object({
        day: z.number().min(1),
        hour: z.number().min(0).max(23),
        minute: z.number().min(0).max(59),
      }),
      outputSchema: z.looseObject({}),
    }),
    z.object({
      type: z.literal('HOURS'),
      schedule: z.object({
        hour: z.number().min(1),
        minute: z.number().min(0).max(59),
      }),
      outputSchema: z.looseObject({}),
    }),
    z.object({
      type: z.literal('MINUTES'),
      schedule: z.object({ minute: z.number().min(1).max(60) }),
      outputSchema: z.looseObject({}),
    }),
    z.object({
      type: z.literal('CUSTOM'),
      pattern: z.string(),
      outputSchema: z.looseObject({}),
    }),
  ]),
});
