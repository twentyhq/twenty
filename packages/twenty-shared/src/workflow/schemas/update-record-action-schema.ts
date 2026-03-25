import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowUpdateRecordActionSettingsSchema } from './update-record-action-settings-schema';

export const workflowUpdateRecordActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('UPDATE_RECORD'),
    settings: workflowUpdateRecordActionSettingsSchema,
  },
);
