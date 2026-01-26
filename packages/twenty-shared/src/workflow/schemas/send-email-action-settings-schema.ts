import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { workflowFileSchema } from './workflow-file-action-schema';

export const workflowEmailRecipientsSchema = z.object({
  to: z.string().optional().default(''),
  cc: z.string().optional().default(''),
  bcc: z.string().optional().default(''),
});

export const workflowSendEmailActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      connectedAccountId: z.string(),
      email: z.string().optional(),
      recipients: workflowEmailRecipientsSchema.optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
      files: z.array(workflowFileSchema).optional().default([]),
    }),
  });
