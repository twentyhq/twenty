import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { webhookOperationSchema } from 'src/engine/metadata-modules/webhook/tools/schemas/webhook-operation.schema';
import { compileWebhookOperations } from 'src/engine/metadata-modules/webhook/tools/utils/compile-webhook-operations.util';
import { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';

const updateWebhookInputSchema = z.object({
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

@DefineTool({
  name: 'update_webhook',
  category: ToolCategory.WEBHOOK,
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
  description: `Update an existing webhook. Only the fields you pass are modified; everything else is preserved.`,
})
export class UpdateWebhookTool extends BaseTool<
  typeof updateWebhookInputSchema
> {
  readonly inputSchema = updateWebhookInputSchema;

  constructor(private readonly webhookService: WebhookService) {
    super();
  }

  async execute(
    parameters: z.infer<typeof updateWebhookInputSchema>,
    { workspaceId }: ToolProviderContext,
  ): Promise<ToolOutput> {
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

    const webhook = await this.webhookService.update(
      { id: parameters.id, update },
      workspaceId,
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
  }
}
