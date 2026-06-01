import { z } from 'zod';

import { type WebhookToolContext } from 'src/engine/metadata-modules/webhook/tools/types/webhook-tool-context.type';
import { type WebhookToolDependencies } from 'src/engine/metadata-modules/webhook/tools/types/webhook-tool-dependencies.type';

const listWebhooksSchema = z.object({});

export const createListWebhooksTool = (
  deps: Pick<WebhookToolDependencies, 'webhookService'>,
  context: WebhookToolContext,
) => ({
  name: 'list_webhooks' as const,
  description: `List every webhook registered in the workspace. Returns id, targetUrl, operations (e.g. ['person.created','company.updated']), description and timestamps.`,
  inputSchema: listWebhooksSchema,
  execute: async () => {
    try {
      const webhooks = await deps.webhookService.findAll(context.workspaceId);

      return {
        success: true,
        message: `Found ${webhooks.length} webhook(s)`,
        result: {
          webhooks: webhooks.map((webhook) => ({
            id: webhook.id,
            targetUrl: webhook.targetUrl,
            operations: webhook.operations,
            description: webhook.description,
            createdAt: webhook.createdAt,
            updatedAt: webhook.updatedAt,
          })),
          count: webhooks.length,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to list webhooks: ${message}`,
        error: message,
      };
    }
  },
});
