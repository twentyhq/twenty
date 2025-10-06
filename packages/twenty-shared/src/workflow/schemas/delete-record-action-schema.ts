import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowDeleteRecordActionSettingsSchema } from './delete-record-action-settings-schema';

export const workflowDeleteRecordActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('DELETE_RECORD'),
    settings: workflowDeleteRecordActionSettingsSchema,
  },
);
