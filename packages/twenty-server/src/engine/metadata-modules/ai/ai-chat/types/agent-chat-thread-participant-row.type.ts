import { type AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';

export type AgentChatThreadParticipantRow = AgentChatThreadParticipantDTO & {
  workspaceMemberId: string;
};
