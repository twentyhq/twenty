import { z } from 'zod';
import { baseTriggerSchema } from './base-trigger-schema';

export const workflowManualTriggerSchema = baseTriggerSchema
  .extend({
    type: z.literal('MANUAL'),
    settings: z.object({
      objectType: z.string().optional(),
      outputSchema: z
        .looseObject({})
        .describe(
          'Schema defining the output data structure. When a record is selected, it is accessible via {{trigger.record.fieldName}}. When no record is selected, no data is available.',
        ),
      icon: z.string().optional(),
      isPinned: z.boolean().optional(),
    }),
  })
  .describe(
    'Manual trigger that can be launched by the user. If a record is selected when launched, it is accessible via {{trigger.record.fieldName}}. If no record is selected, no data context is available.',
  );
