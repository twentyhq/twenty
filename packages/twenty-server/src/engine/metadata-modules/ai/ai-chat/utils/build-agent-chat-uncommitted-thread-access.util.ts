import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export const buildAgentChatUncommittedThreadAccess = (
  thread: AgentChatThreadWorkspaceEntity,
) => ({
  record: { ...thread },
  privateRecordState: {
    isPrivate: true,
    createdByWorkspaceMemberId: thread.workspaceMemberId,
  },
});
