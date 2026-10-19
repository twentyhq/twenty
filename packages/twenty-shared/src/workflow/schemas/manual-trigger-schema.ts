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
          'Schema defining the output data structure. With SINGLE_RECORD availability, the selected record is accessible via {{trigger.payload.fieldName}}. With BULK_RECORDS availability, the selected records are accessible via {{trigger.payload.<objectNamePlural>}} (e.g., {{trigger.payload.companies}}). When no record is selected, no record data is available.',
        ),
      icon: z.string().optional(),
      isPinned: z.boolean().optional(),
      availability: z
        .discriminatedUnion('type', [
          z.object({
            type: z.literal('GLOBAL'),
            locations: z.array(z.string()).optional(),
          }),
          z.object({
            type: z.literal('SINGLE_RECORD'),
            objectNameSingular: z.string(),
          }),
          z.object({
            type: z.literal('BULK_RECORDS'),
            objectNameSingular: z.string(),
          }),
        ])
        .optional()
        .nullable(),
    }),
  })
  .describe(
    'Manual trigger that can be launched by the user. If a record is selected when launched, it is accessible via {{trigger.payload.fieldName}}. If no record is selected, no record data is available.',
  );
