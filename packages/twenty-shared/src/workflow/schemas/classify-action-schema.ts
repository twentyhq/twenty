import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowClassifyActionSettingsSchema } from './classify-action-settings-schema';

export const workflowClassifyActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('CLASSIFY'),
  settings: workflowClassifyActionSettingsSchema,
});
