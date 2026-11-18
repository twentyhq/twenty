import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export type AgentChatPushNotificationThread = Pick<
  AgentChatThreadWorkspaceEntity,
  | 'id'
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
  | 'assigneeId'
  | 'lastActivityAt'
  | 'lastMessageText'
  | 'lastMessageSenderWorkspaceMemberId'
  | 'deletedAt'
>;
