import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-last-message-text-max-length.constant';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';

type ThreadUsageUpdate = {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalInputCredits: number;
  totalOutputCredits: number;
  totalCacheReadTokens: number;
  totalCacheCreationTokens: number;
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
    // sum in Postgres: JS numbers must never be added to exact NUMERIC totals
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
        "pendingQuestionMessageId" = $11, "lastStreamError" = NULL,
        ${
          isDefined(recordedActivity)
            ? `"lastActivityAt" = clock_timestamp(),
        "lastMessageText" = left(NULLIF(btrim($12), ''), ${AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH}),
        "lastMessageSenderWorkspaceMemberId" = NULL,`
            : ''
        } "updatedAt" = now()
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
        ...(isDefined(recordedActivity)
          ? [recordedActivity.lastMessageText]
          : []),
      ],
    );
    return { affected: rows.length };
  });
