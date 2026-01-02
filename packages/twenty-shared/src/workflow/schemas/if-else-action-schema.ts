import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowIfElseActionSettingsSchema } from './if-else-action-settings-schema';

export const workflowIfElseActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('IF_ELSE'),
  settings: workflowIfElseActionSettingsSchema,
});
