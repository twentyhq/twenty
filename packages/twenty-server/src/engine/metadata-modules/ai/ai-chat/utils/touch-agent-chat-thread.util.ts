import { isDefined } from 'twenty-shared/utils';

import { buildAgentChatThreadActivitySetClause } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-activity-set-clause.util';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export const touchAgentChatThread = ({
  repository,
  workspaceId,
  threadId,
  recordedActivity,
}: {
  repository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>;
  workspaceId: string;
  threadId: string;
  // Null before the 2.46 upgrade, when only updatedAt exists to order chats by
  recordedActivity: { text: string | null } | null;
}): Promise<{
  threadBefore: AgentChatThreadWorkspaceEntity | undefined;
  threadAfter: AgentChatThreadWorkspaceEntity | undefined;
}> =>
  repository.query(workspaceId, async ({ manager, table }) => {
    const [threadBefore] = await manager.query<
      AgentChatThreadWorkspaceEntity[]
    >(`SELECT * FROM ${table('agentChatThread')} WHERE id = $1 FOR UPDATE`, [
      threadId,
    ]);
    const [threadAfter] = await manager.query<AgentChatThreadWorkspaceEntity[]>(
      `WITH thread AS (
         UPDATE ${table('agentChatThread')}
         SET "updatedAt" = now()${
           isDefined(recordedActivity)
             ? `, ${buildAgentChatThreadActivitySetClause({ textParameter: '$2' })}`
             : ''
         }
         WHERE id = $1
         RETURNING *
       )
       SELECT * FROM thread`,
      isDefined(recordedActivity)
        ? [threadId, recordedActivity.text]
        : [threadId],
    );

    return { threadBefore, threadAfter };
  });
