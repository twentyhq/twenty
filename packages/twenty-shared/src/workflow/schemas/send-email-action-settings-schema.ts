import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { workflowFileSchema } from './workflow-file-action-schema';

export const workflowEmailFilesSchema = z
  .array(
    z.union([
      workflowFileSchema,
      z
        .string()
        .regex(
          /^{{[^{}]+}}$/,
          'Expected a workflow variable reference like {{stepId.path}}',
        )
        .describe('A workflow variable reference resolving to files'),
    ]),
  )
  .optional()
  .default([]);

export type WorkflowEmailFiles = z.infer<typeof workflowEmailFilesSchema>;

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
      files: workflowEmailFilesSchema,
      inReplyTo: z.string().trim().optional(),
    }),
  });
