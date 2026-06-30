import { z } from 'zod';

import { webhookOperationSchema } from 'src/engine/metadata-modules/webhook/tools/schemas/webhook-operation.schema';
import { type WebhookToolContext } from 'src/engine/metadata-modules/webhook/tools/types/webhook-tool-context.type';
import { type WebhookToolDependencies } from 'src/engine/metadata-modules/webhook/tools/types/webhook-tool-dependencies.type';
import { compileWebhookOperations } from 'src/engine/metadata-modules/webhook/tools/utils/compile-webhook-operations.util';

const createWebhookSchema = z.object({
  targetUrl: z
    .string()
    .url()
    .describe('Absolute URL the webhook payload should be POSTed to'),
  operations: webhookOperationSchema,
  description: z
    .string()
    .optional()
    .describe('Optional human description for the webhook'),
  secret: z
    .string()
    .optional()
    .describe(
      'Optional shared secret used to sign payloads. A secret is generated if omitted.',
    ),
});

type CreateWebhookParams = z.infer<typeof createWebhookSchema>;

export const createCreateWebhookTool = (
  deps: Pick<WebhookToolDependencies, 'webhookService'>,
  context: WebhookToolContext,
) => ({
  name: 'create_webhook' as const,
  description: `Register a new outgoing webhook for this workspace.

Operations are structured entries discriminated by 'kind':
- {kind:'record', object:'person', event:'created'} → fires when a person is created (compiles to 'person.created').
- {kind:'record', object:'*', event:'*'} → fires on every record event.
- {kind:'metadata', metadataName:'workflow', operation:'updated'} → fires when a workflow definition is updated (compiles to 'metadata.workflow.updated').
- {kind:'metadata', metadataName:'*', operation:'*'} → fires on every metadata change.

Mix as needed: pass one array containing both record and metadata operations.`,
  inputSchema: createWebhookSchema,
  execute: async (parameters: CreateWebhookParams) => {
    try {
      const webhook = await deps.webhookService.create(
        {
          targetUrl: parameters.targetUrl,
          operations: compileWebhookOperations(parameters.operations),
          description: parameters.description,
          secret: parameters.secret,
        },
        context.workspaceId,
      );

      return {
        success: true,
        message: `Webhook created for ${webhook.targetUrl}`,
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
        message: `Failed to create webhook: ${message}`,
        error: message,
      };
    }
  },
});
