import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { objectRecordSchema } from './object-record-schema';

export const workflowUpsertRecordActionSettingsSchema =
baseWorkflowActionSettingsSchema.extend({
  input: z.object({
    objectName: z
      .string()
      .describe(
        'The name of the object to create or update a record in. Must be lowercase (e.g., "person", "company", "task").',
      ),
    objectRecord: objectRecordSchema.describe(
      'The record data to create or update.',
    ),
    upsertCriteria: z
      .object({
        matchFields: z
          .array(z.string())
          .min(1)
          .describe(
            'The fields to match on when searching for an existing record (e.g., ["email"], ["name", "companyId"]).',
          ),
      })
      .describe(
        'Criteria for matching existing records. If a record matching these fields exists, it will be updated; otherwise, a new record will be created.',
      ),
    fieldsToUpdate: z
      .array(z.string())
      .optional()
      .describe(
        'Optional. Specific fields to update if a matching record is found. If not provided, all fields in objectRecord will be updated.',
      ),
    }),
  });
