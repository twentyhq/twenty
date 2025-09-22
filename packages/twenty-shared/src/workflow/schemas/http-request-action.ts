import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowHttpRequestActionSettingsSchema } from './http-request-action-schema';

export const workflowHttpRequestActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('HTTP_REQUEST'),
  settings: workflowHttpRequestActionSettingsSchema,
});
