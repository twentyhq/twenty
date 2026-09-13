import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowRunWorkflowActionSettingsSchema } from './workflow-run-workflow-action-settings-schema';

export const workflowRunWorkflowActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('RUN_WORKFLOW'),
  settings: workflowRunWorkflowActionSettingsSchema,
});
