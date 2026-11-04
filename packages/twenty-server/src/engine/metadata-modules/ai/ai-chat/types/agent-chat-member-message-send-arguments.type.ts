import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { type AgentChatMemberMessageActor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-actor.type';
import { type AgentChatMemberMessage } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message.type';
import { type AgentChatMessageAddressing } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-message-addressing.type';

export type AgentChatMemberMessageSendArguments = {
  actor: AgentChatMemberMessageActor;
  target: { threadId: string; channelId?: string };
  message: AgentChatMemberMessage;
  addressing: AgentChatMessageAddressing;
  assistant: {
    isMentioned: boolean;
    isInitiallyIncluded: boolean;
    isReplyRequested: boolean;
  };
  execution: { modelId?: string; browsingContext: BrowsingContextType | null };
};
