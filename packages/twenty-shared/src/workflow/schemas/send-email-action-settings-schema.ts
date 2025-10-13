import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { workflowFileSchema } from './workflow-file-action-schema';

export const workflowSendEmailActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      connectedAccountId: z.string(),
      email: z.string(),
      subject: z.string().optional(),
      body: z.string().optional(),
      files: z.array(workflowFileSchema).optional().default([]),
    }),
  });
