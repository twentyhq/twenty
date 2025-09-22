import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowUpdateRecordActionSettingsSchema } from './update-record-action-schema';

export const workflowUpdateRecordActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('UPDATE_RECORD'),
  settings: workflowUpdateRecordActionSettingsSchema,
});
