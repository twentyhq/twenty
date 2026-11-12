import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export type AgentChatAuthorizedConversation = {
  authContext: UserWorkspaceAuthContext;
  thread: AgentChatThreadWorkspaceEntity;
};
