import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
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

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof updateWebhookInputSchema>): Promise<ToolOutput> {
    const update: {
      targetUrl?: string;
      operations?: string[];
      description?: string;
      secret?: string;
    } = {};

    if (isDefined(input.targetUrl)) {
      update.targetUrl = input.targetUrl;
    }
    if (isDefined(input.operations)) {
      update.operations = compileWebhookOperations(input.operations);
    }
    if (isDefined(input.description)) {
      update.description = input.description;
    }
    if (isDefined(input.secret)) {
      update.secret = input.secret;
    }

    const webhook = await this.webhookService.update(
      { id: input.id, update },
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
