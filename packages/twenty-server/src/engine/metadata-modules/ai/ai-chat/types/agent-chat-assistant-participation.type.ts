import { type AgentChatAssistantDecision } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-decision.type';

export type AgentChatAssistantParticipation = AgentChatAssistantDecision & {
  isInitialMessage: boolean;
};
