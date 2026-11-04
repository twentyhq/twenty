import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';

export type AgentChatThreadParticipantWrite = {
  before: AgentChatThreadParticipantRow | null;
  after: AgentChatThreadParticipantRow;
};
