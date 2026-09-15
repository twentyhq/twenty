import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowPickRecordActionSettingsSchema } from './pick-record-action-settings-schema';

export const workflowPickRecordActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('PICK_RECORD'),
  settings: workflowPickRecordActionSettingsSchema,
});
