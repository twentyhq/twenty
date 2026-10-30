import { isDefined } from 'twenty-shared/utils';

import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';

export const buildAgentChatAssistantReplyProviderMetadata = (
  context: AgentChatAssistantReplyContext | undefined,
) => {
  if (!isDefined(context)) {
    return undefined;
  }

  return {
    twenty: {
      assistantReplyContext: {
        isAssistantMentioned: context.isAssistantMentioned,
        isDirectAssistantChat: context.isDirectAssistantChat,
        ...(isDefined(context.isStructuredRequestContinuation)
          ? {
              isStructuredRequestContinuation:
                context.isStructuredRequestContinuation,
            }
          : {}),
      },
    },
  };
};
