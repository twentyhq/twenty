import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export type AgentChatThreadActivity = {
  lastActivityAt: Date | null;
  updatedAt: Date;
} & Partial<
  Pick<
    AgentChatThreadWorkspaceEntity,
    | 'lastMessageText'
    | 'lastMessageSenderWorkspaceMemberId'
    | 'writerWorkspaceMemberIds'
    | 'pendingQuestionMessageId'
  >
>;
