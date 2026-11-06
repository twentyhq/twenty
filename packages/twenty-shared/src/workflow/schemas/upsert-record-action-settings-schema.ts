import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { objectRecordSchema } from './object-record-schema';
import { unsupportedFieldsToUpdateSchema } from './unsupported-fields-to-update-schema';

export const workflowUpsertRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      objectRecord: objectRecordSchema,
      fieldsToUpdate: unsupportedFieldsToUpdateSchema,
    }),
  });
