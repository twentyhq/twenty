import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type WebhookCaller } from 'src/engine/metadata-modules/webhook/types/webhook-caller.type';

export const buildWebhookCallerFromToolContext = (
  context: ToolProviderContext,
): WebhookCaller => ({
  userWorkspaceId: context.userWorkspaceId,
  apiKeyId:
    context.authContext?.type === 'apiKey'
      ? context.authContext.apiKey.id
      : undefined,
  applicationId: context.application?.id,
  agentId: context.agentId,
});
