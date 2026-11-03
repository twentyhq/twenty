import { isBoolean } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';

export const readAgentChatAssistantReplyContext = (
  parts:
    | Pick<AgentMessagePartWorkspaceEntity, 'type' | 'providerMetadata'>[]
    | undefined,
): AgentChatAssistantReplyContext | undefined => {
  for (const part of parts ?? []) {
    if (part.type !== 'text') {
      continue;
    }

    const context = part.providerMetadata?.twenty?.assistantReplyContext;

    if (!isPlainObject(context)) {
      continue;
    }

    const {
      isAssistantMentioned,
      isDirectAssistantChat,
      isStructuredRequestContinuation,
    } = context;

    if (
      !isBoolean(isAssistantMentioned) ||
      !isBoolean(isDirectAssistantChat) ||
      !isBoolean(isStructuredRequestContinuation)
    ) {
      continue;
    }

    return {
      isAssistantMentioned,
      isDirectAssistantChat,
      isStructuredRequestContinuation,
    };
  }

  return undefined;
};
