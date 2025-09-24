import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowEmptyActionSettingsSchema } from './empty-action-settings-schema';

export const workflowEmptyActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('EMPTY'),
  settings: workflowEmptyActionSettingsSchema,
});
