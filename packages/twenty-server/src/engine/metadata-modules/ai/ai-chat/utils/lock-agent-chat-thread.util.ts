import { buildRecordShareLockKey } from 'src/engine/core-modules/record-share/utils/build-record-share-lock-key.util';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { normalizeAgentHistoryRecord } from 'src/engine/metadata-modules/ai/ai-history/utils/normalize-agent-history-record.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const lockAgentChatThread = async ({
  context: { manager, table },
  workspaceId,
  objectMetadataId,
  threadId,
}: {
  context: AgentHistoryStorageContext;
  workspaceId: string;
  objectMetadataId: string;
  threadId: string;
}): Promise<AgentChatThreadEntity> => {
  // Match generic sharing's lock order so concurrent revocations and domain
  // writes cannot authorize against different grant/record snapshots.
  await manager.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [
    buildRecordShareLockKey({
      workspaceId,
      objectMetadataId,
      recordId: threadId,
    }),
  ]);
  const records = await manager.query<AgentChatThreadEntity[]>(
    `SELECT * FROM ${table('agentChatThread')} WHERE id = $1 FOR UPDATE`,
    [threadId],
  );
  if (records.length !== 1) {
    throw new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND);
  }
  return normalizeAgentHistoryRecord({
    record: records[0],
    workspaceId,
    objectName: 'agentChatThread',
  }) as AgentChatThreadEntity;
};
