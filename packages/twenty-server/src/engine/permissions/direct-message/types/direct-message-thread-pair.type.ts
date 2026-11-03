import { type AgentChatThreadConversationType } from 'src/engine/metadata-modules/ai/ai-history/types/agent-chat-thread-conversation-type.type';

export type DirectMessageThreadPair = {
  conversationType: AgentChatThreadConversationType;
  directMessageFirstWorkspaceMemberId: string | null;
  directMessageSecondWorkspaceMemberId: string | null;
};
