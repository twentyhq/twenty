import { type AgentChatThreadActivity } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-activity.type';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

// Before the 2.46 upgrade only updatedAt exists to order chats by
export const touchAgentChatThread = async ({
  repository,
  workspaceId,
  threadId,
}: {
  repository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>;
  workspaceId: string;
  threadId: string;
}): Promise<AgentChatThreadActivity | null> => {
  const [activity] = await repository.query(workspaceId, ({ manager, table }) =>
    manager.query<AgentChatThreadActivity[]>(
      `WITH thread AS (
         UPDATE ${table('agentChatThread')}
         SET "updatedAt" = now()
         WHERE id = $1
         RETURNING NULL::timestamptz AS "lastActivityAt", "updatedAt", "pendingQuestionMessageId"
       )
       SELECT "lastActivityAt", "updatedAt", "pendingQuestionMessageId" FROM thread`,
      [threadId],
    ),
  );

  return activity ?? null;
};
