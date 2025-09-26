import { z } from 'zod';
import { baseTriggerSchema } from './base-trigger-schema';

export const workflowDatabaseEventTriggerSchema = baseTriggerSchema
  .extend({
    type: z.literal('DATABASE_EVENT'),
    settings: z.object({
      eventName: z
        .string()
        .regex(
          /^[a-z][a-zA-Z0-9_]*\.(created|updated|deleted|upserted)$/,
          'Event name must follow the pattern: objectName.action (e.g., "company.created", "person.updated", "company.upserted")',
        )
        .describe(
          'Event name in format: objectName.action (e.g., "company.created", "person.updated", "task.deleted", "company.upserted"). Use lowercase object names.',
        ),
      input: z.looseObject({}).optional(),
      outputSchema: z
        .looseObject({})
        .describe(
          'Schema defining the output data structure. For database events, this includes the record that triggered the workflow accessible via {{trigger.object.fieldName}}.',
        ),
      objectType: z.string().optional(),
      fields: z.array(z.string()).optional().nullable(),
    }),
  })
  .describe(
    'Database event trigger that fires when a record is created, updated, deleted, or upserted. The triggered record is accessible in workflow steps via {{trigger.object.fieldName}}.',
  );
