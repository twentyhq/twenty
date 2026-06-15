import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { workflowFileSchema } from './workflow-file-action-schema';

export const workflowSendEmailFilesSchema = z
  .array(
    z.union([
      workflowFileSchema,
      z.string().describe('A workflow variable reference resolving to files'),
    ]),
  )
  .optional()
  .default([]);

export type WorkflowSendEmailFiles = z.infer<
  typeof workflowSendEmailFilesSchema
>;

export const workflowSendEmailActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      connectedAccountId: z.string(),
      recipients: z.object({
        to: z.string().optional().default(''),
        cc: z.string().optional().default(''),
        bcc: z.string().optional().default(''),
      }),
      subject: z.string().optional(),
      body: z.string().optional(),
      files: workflowSendEmailFilesSchema,
      inReplyTo: z.string().trim().optional(),
    }),
  });
