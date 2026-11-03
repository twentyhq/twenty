import { type AgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation.type';

export type AgentChatMessageParticipation = {
  assistantParticipation: AgentChatAssistantParticipation;
  mentionedWorkspaceMemberIds: string[];
  recipientWorkspaceMemberIds: string[];
};
