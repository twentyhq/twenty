import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { objectRecordSchema } from './object-record-schema';

export const workflowCreateRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z
        .string()
        .describe(
          'The name of the object to create a record in. Must be lowercase (e.g., "person", "company", "task").',
        ),
      objectRecord: objectRecordSchema.describe('The record data to create.'),
    }),
  });
