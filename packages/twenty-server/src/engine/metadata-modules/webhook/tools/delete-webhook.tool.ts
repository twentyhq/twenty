import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';

const deleteWebhookInputSchema = z.object({
  id: z.uuid().describe('The id of the webhook to delete'),
});

@DefineTool({
  name: 'delete_webhook',
  category: ToolCategory.WEBHOOK,
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
  description: `Delete a webhook by id. Use list_webhooks first if you don't know the id.`,
})
export class DeleteWebhookTool extends BaseTool<
  typeof deleteWebhookInputSchema
> {
  readonly inputSchema = deleteWebhookInputSchema;

  constructor(private readonly webhookService: WebhookService) {
    super();
  }

  async execute({
    input: { id },
    context: { workspaceId },
  }: ToolExecuteArgs<typeof deleteWebhookInputSchema>): Promise<ToolOutput> {
    const webhook = await this.webhookService.delete(id, workspaceId);

    return {
      success: true,
      message: `Webhook ${webhook.id} deleted`,
      result: { deletedWebhookId: webhook.id, targetUrl: webhook.targetUrl },
    };
  }
}
