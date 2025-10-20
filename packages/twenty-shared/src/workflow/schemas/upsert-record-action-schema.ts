import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowUpsertRecordActionSettingsSchema } from './upsert-record-action-settings-schema';

export const workflowUpsertRecordActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('UPSERT_RECORD'),
    settings: workflowUpsertRecordActionSettingsSchema,
  },
);
