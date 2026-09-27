import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';

type ThreadUsageUpdate = Pick<
  AgentChatThreadEntity,
  | 'totalInputTokens'
  | 'totalOutputTokens'
  | 'totalInputCredits'
  | 'totalOutputCredits'
  | 'totalCacheReadTokens'
  | 'totalCacheCreationTokens'
  | 'contextWindowTokens'
  | 'conversationSize'
  | 'pendingQuestionMessageId'
>;

export const updateAgentChatThreadUsage = async ({
  repository,
  workspaceId,
  threadId,
  streamId,
  usage,
}: {
  repository: AgentHistoryRepository<AgentChatThreadEntity>;
  workspaceId: string;
  threadId: string;
  streamId: string;
  usage: ThreadUsageUpdate;
}): Promise<{ affected: number }> =>
  repository.query(workspaceId, async ({ manager, table }) => {
    // Keep arithmetic in PostgreSQL and ownership in the same UPDATE. DTO numbers
    // must never be read back and added to exact NUMERIC totals in JavaScript.
    const rows = await manager.query<{ id: string }[]>(
      `
    WITH updated AS (
      UPDATE ${table('agentChatThread')} SET
        "totalInputTokens" = "totalInputTokens" + $3,
        "totalOutputTokens" = "totalOutputTokens" + $4,
        "totalInputCredits" = "totalInputCredits" + $5,
        "totalOutputCredits" = "totalOutputCredits" + $6,
        "totalCacheReadTokens" = "totalCacheReadTokens" + $7,
        "totalCacheCreationTokens" = "totalCacheCreationTokens" + $8,
        "contextWindowTokens" = $9, "conversationSize" = $10,
        "pendingQuestionMessageId" = $11, "lastStreamError" = NULL, "updatedAt" = now()
      WHERE id = $1 AND "activeStreamId" = $2
      RETURNING id
    ) SELECT id FROM updated`,
      [
        threadId,
        streamId,
        usage.totalInputTokens,
        usage.totalOutputTokens,
        usage.totalInputCredits,
        usage.totalOutputCredits,
        usage.totalCacheReadTokens,
        usage.totalCacheCreationTokens,
        usage.contextWindowTokens,
        usage.conversationSize,
        usage.pendingQuestionMessageId,
      ],
    );
    return { affected: rows.length };
  });
