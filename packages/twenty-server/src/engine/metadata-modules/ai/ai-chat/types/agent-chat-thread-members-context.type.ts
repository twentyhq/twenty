import { type AgentChatThreadMember } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-member.type';

export type AgentChatThreadMembersContext = {
  members: AgentChatThreadMember[];
  totalCount: number;
  canMentionMembers: boolean;
  canListMembers: boolean;
};
