import { type AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';

export type AgentChatThreadLastMessageSummary = {
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  lastMessageRole: AgentMessageRole | null;
  lastMessageAuthorUserWorkspaceId: string | null;
};
