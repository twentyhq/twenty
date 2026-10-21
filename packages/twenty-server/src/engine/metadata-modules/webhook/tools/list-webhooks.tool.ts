import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';

const listWebhooksInputSchema = z.object({});

@DefineTool({
  name: 'list_webhooks',
  category: ToolCategory.WEBHOOK,
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
  description: `List every webhook registered in the workspace. Returns id, targetUrl, operations (e.g. ['person.created','company.updated']), description and timestamps.`,
})
export class ListWebhooksTool extends BaseTool<typeof listWebhooksInputSchema> {
  readonly inputSchema = listWebhooksInputSchema;

  constructor(private readonly webhookService: WebhookService) {
    super();
  }

  async execute({
    context: { workspaceId },
  }: ToolExecuteArgs<typeof listWebhooksInputSchema>): Promise<ToolOutput> {
    const webhooks = await this.webhookService.findAll(workspaceId);

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
  }
}
