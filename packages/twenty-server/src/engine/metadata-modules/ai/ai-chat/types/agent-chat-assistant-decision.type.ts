import { type AgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-reply-decision.type';

export type AgentChatAssistantDecision = {
  isAssistantParticipant: boolean;
  replyDecision: AgentChatReplyDecision;
};
