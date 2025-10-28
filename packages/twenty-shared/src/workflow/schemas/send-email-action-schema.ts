import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowSendEmailActionSettingsSchema } from './send-email-action-settings-schema';

export const workflowSendEmailActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('SEND_EMAIL'),
  settings: workflowSendEmailActionSettingsSchema,
});
