import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowIteratorActionSettingsSchema } from './iterator-action-settings-schema';

export const workflowIteratorActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('ITERATOR'),
  settings: workflowIteratorActionSettingsSchema,
});
