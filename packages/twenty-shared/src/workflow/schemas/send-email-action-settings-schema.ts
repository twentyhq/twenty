import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { workflowFileSchema } from './workflow-file-action-schema';
import { workflowVariableReferenceSchema } from './workflow-variable-reference-schema';

export const workflowEmailFilesSchema = z
  .array(
    z.union([
      workflowFileSchema,
      workflowVariableReferenceSchema.describe(
        'A workflow variable reference resolving to files',
      ),
    ]),
  )
  .optional()
  .default([]);

export type WorkflowEmailFiles = z.infer<typeof workflowEmailFilesSchema>;

export const workflowSendEmailActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      connectedAccountId: z.string(),
      fromHandle: z.string().trim().optional(),
      recipients: z.object({
        to: z.string().optional().default(''),
        cc: z.string().optional().default(''),
        bcc: z.string().optional().default(''),
      }),
      subject: z.string().optional(),
      body: z
        .string()
        .optional()
        .describe(
          'The email body as a serialized email document: JSON.stringify of {"type":"doc","attrs":{"schemaVersion":1},"content":[...]} with paragraph, heading, bulletList, orderedList, image, button, divider and html blocks. Use {{stepId.field}} for variables. To send a complete HTML email verbatim, including HTML produced by an earlier step such as {{stepId.html}}, make the body a single htmlDocument block ({"type":"htmlDocument","attrs":{"html":"..."}}): it is sent without the email layout and its variables are inserted as raw HTML, while an html block is embedded in the layout with escaped variables. HTML or plain text strings are rejected.',
        ),
      files: workflowEmailFilesSchema,
      inReplyTo: z.string().trim().optional(),
    }),
  });
