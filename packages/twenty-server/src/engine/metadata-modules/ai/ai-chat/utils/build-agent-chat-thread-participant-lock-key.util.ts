import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';

export const buildAgentChatThreadParticipantLockKey = ({
  workspaceId,
  threadId,
  workspaceMemberId,
}: AgentChatThreadAccessArgs): string =>
  `agent-chat-thread-participant:${workspaceId}:${threadId}:${workspaceMemberId}`;
