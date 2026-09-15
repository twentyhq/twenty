import { z } from 'zod';

import { webhookOperationSchema } from 'src/engine/metadata-modules/webhook/tools/schemas/webhook-operation.schema';
import { type WebhookToolContext } from 'src/engine/metadata-modules/webhook/tools/types/webhook-tool-context.type';
import { type WebhookToolDependencies } from 'src/engine/metadata-modules/webhook/tools/types/webhook-tool-dependencies.type';
import { compileWebhookOperations } from 'src/engine/metadata-modules/webhook/tools/utils/compile-webhook-operations.util';

const updateWebhookSchema = z.object({
  id: z.uuid().describe('The id of the webhook to update'),
  targetUrl: z
    .string()
    .url()
    .optional()
    .describe('New target URL. Leave unset to keep the current value.'),
  operations: webhookOperationSchema
    .optional()
    .describe('Replaces the operations list. Leave unset to keep current.'),
  description: z.string().optional(),
  secret: z.string().optional(),
});

type UpdateWebhookParams = z.infer<typeof updateWebhookSchema>;

export const createUpdateWebhookTool = (
  deps: Pick<WebhookToolDependencies, 'webhookService'>,
  context: WebhookToolContext,
) => ({
  name: 'update_webhook' as const,
  description: `Update an existing webhook. Only the fields you pass are modified; everything else is preserved.`,
  inputSchema: updateWebhookSchema,
  execute: async (parameters: UpdateWebhookParams) => {
    try {
      const update: {
        targetUrl?: string;
        operations?: string[];
        description?: string;
        secret?: string;
      } = {};

      if (parameters.targetUrl !== undefined) {
        update.targetUrl = parameters.targetUrl;
      }
      if (parameters.operations !== undefined) {
        update.operations = compileWebhookOperations(parameters.operations);
      }
      if (parameters.description !== undefined) {
        update.description = parameters.description;
      }
      if (parameters.secret !== undefined) {
        update.secret = parameters.secret;
      }

      const webhook = await deps.webhookService.update(
        { id: parameters.id, update },
        context.workspaceId,
      );

      return {
        success: true,
        message: `Webhook ${webhook.id} updated`,
        result: {
          id: webhook.id,
          targetUrl: webhook.targetUrl,
          operations: webhook.operations,
          description: webhook.description,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to update webhook: ${message}`,
        error: message,
      };
    }
  },
});
