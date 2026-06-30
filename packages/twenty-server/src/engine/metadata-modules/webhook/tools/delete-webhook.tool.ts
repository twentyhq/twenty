import { z } from 'zod';

import { type WebhookToolContext } from 'src/engine/metadata-modules/webhook/tools/types/webhook-tool-context.type';
import { type WebhookToolDependencies } from 'src/engine/metadata-modules/webhook/tools/types/webhook-tool-dependencies.type';

const deleteWebhookSchema = z.object({
  id: z.uuid().describe('The id of the webhook to delete'),
});

type DeleteWebhookParams = z.infer<typeof deleteWebhookSchema>;

export const createDeleteWebhookTool = (
  deps: Pick<WebhookToolDependencies, 'webhookService'>,
  context: WebhookToolContext,
) => ({
  name: 'delete_webhook' as const,
  description: `Delete a webhook by id. Use list_webhooks first if you don't know the id.`,
  inputSchema: deleteWebhookSchema,
  execute: async (parameters: DeleteWebhookParams) => {
    try {
      const webhook = await deps.webhookService.delete(
        parameters.id,
        context.workspaceId,
      );

      return {
        success: true,
        message: `Webhook ${webhook.id} deleted`,
        result: { deletedWebhookId: webhook.id, targetUrl: webhook.targetUrl },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to delete webhook: ${message}`,
        error: message,
      };
    }
  },
});
