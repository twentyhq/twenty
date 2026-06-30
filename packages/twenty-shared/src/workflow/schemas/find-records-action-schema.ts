import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowFindRecordsActionSettingsSchema } from './find-records-action-settings-schema';

export const workflowFindRecordsActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('FIND_RECORDS'),
  settings: workflowFindRecordsActionSettingsSchema,
});
