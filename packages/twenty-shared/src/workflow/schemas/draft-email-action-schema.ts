import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowSendEmailActionSettingsSchema } from './send-email-action-settings-schema';

export const workflowDraftEmailActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('DRAFT_EMAIL'),
  settings: workflowSendEmailActionSettingsSchema,
});
