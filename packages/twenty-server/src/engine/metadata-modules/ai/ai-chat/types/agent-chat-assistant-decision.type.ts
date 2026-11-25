import { type AgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-decision.enum';

export type AgentChatAssistantDecision = {
  isAssistantParticipant: boolean;
  replyDecision: AgentChatReplyDecision;
};
