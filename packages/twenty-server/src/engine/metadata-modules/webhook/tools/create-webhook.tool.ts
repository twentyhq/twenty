import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { webhookOperationSchema } from 'src/engine/metadata-modules/webhook/tools/schemas/webhook-operation.schema';
import { compileWebhookOperations } from 'src/engine/metadata-modules/webhook/tools/utils/compile-webhook-operations.util';
import { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';

const createWebhookInputSchema = z.object({
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

@DefineTool({
  name: 'create_webhook',
  category: ToolCategory.WEBHOOK,
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
  description: `Register a new outgoing webhook for this workspace.

Operations are structured entries discriminated by 'kind':
- {kind:'record', object:'person', event:'created'} → fires when a person is created (compiles to 'person.created').
- {kind:'record', object:'*', event:'*'} → fires on every record event except 'workflowRun.updated', which only matches an explicit {kind:'record', object:'workflowRun', event:'updated'} entry.
- {kind:'metadata', metadataName:'workflow', operation:'updated'} → fires when a workflow definition is updated (compiles to 'metadata.workflow.updated').
- {kind:'metadata', metadataName:'*', operation:'*'} → fires on every metadata change.

Mix as needed: pass one array containing both record and metadata operations.`,
})
export class CreateWebhookTool extends BaseTool<
  typeof createWebhookInputSchema
> {
  readonly inputSchema = createWebhookInputSchema;

  constructor(private readonly webhookService: WebhookService) {
    super();
  }

  async execute({
    input: { targetUrl, operations, description, secret },
    context: { workspaceId },
  }: ToolExecuteArgs<typeof createWebhookInputSchema>): Promise<ToolOutput> {
    const webhook = await this.webhookService.create(
      {
        targetUrl,
        operations: compileWebhookOperations(operations),
        description,
        secret,
      },
      workspaceId,
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
  }
}
