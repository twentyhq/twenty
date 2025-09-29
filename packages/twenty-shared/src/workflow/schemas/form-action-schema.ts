import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowFormActionSettingsSchema } from './form-action-settings-schema';

export const workflowFormActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('FORM'),
  settings: workflowFormActionSettingsSchema,
});
