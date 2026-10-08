import { isDefined } from 'twenty-shared/utils';

import { buildAgentChatThreadActivitySetClause } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-activity-set-clause.util';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';

type ThreadUsageUpdate = {
  contextWindowTokens: number | null;
  conversationSize: number;
  pendingQuestionMessageId: string | null;
};

export const updateAgentChatThreadUsage = async ({
  repository,
  workspaceId,
  threadId,
  streamId,
  usage,
  recordedActivity,
}: {
  repository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>;
  workspaceId: string;
  threadId: string;
  streamId: string;
  usage: ThreadUsageUpdate;
  // Null before the 2.46 upgrade adds the activity columns
  recordedActivity: { lastMessageText: string | null } | null;
}): Promise<{ affected: number }> =>
  repository.query(workspaceId, async ({ manager, table }) => {
    const rows = await manager.query<{ id: string }[]>(
      `
    WITH updated AS (
      UPDATE ${table('agentChatThread')} SET
        "contextWindowTokens" = $3, "conversationSize" = $4,
        "pendingQuestionMessageId" = $5,
        ${
          isDefined(recordedActivity)
            ? `${buildAgentChatThreadActivitySetClause({ textParameter: '$6' })},`
            : ''
        } "updatedAt" = now()
      WHERE id = $1 AND "activeStreamId" = $2
      RETURNING id
    ) SELECT id FROM updated`,
      [
        threadId,
        streamId,
        usage.contextWindowTokens,
        usage.conversationSize,
        usage.pendingQuestionMessageId,
        ...(isDefined(recordedActivity)
          ? [recordedActivity.lastMessageText]
          : []),
      ],
    );
    return { affected: rows.length };
  });
