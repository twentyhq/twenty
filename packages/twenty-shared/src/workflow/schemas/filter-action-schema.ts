import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowFilterActionSettingsSchema } from './filter-action-settings-schema';

export const workflowFilterActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('FILTER'),
  settings: workflowFilterActionSettingsSchema,
});
