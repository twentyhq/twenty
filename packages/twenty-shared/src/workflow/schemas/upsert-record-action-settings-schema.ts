import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { objectRecordSchema } from './object-record-schema';

export const workflowUpsertRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.strictObject({
      objectName: z.string(),
      objectRecord: objectRecordSchema,
    }),
  });
