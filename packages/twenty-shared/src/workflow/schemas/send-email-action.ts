import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowSendEmailActionSettingsSchema } from './send-email-action-schema';

export const workflowSendEmailActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('SEND_EMAIL'),
  settings: workflowSendEmailActionSettingsSchema,
});
