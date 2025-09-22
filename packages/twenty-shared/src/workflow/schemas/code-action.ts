import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowCodeActionSettingsSchema } from './code-action-schema';

export const workflowCodeActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('CODE'),
  settings: workflowCodeActionSettingsSchema,
});
