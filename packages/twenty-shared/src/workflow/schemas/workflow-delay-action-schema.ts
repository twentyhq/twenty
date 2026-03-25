import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowDelayActionSettingsSchema } from './workflow-delay-action-settings-schema';

export const workflowDelayActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('DELAY'),
  settings: workflowDelayActionSettingsSchema,
});
