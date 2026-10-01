import { buildRecordShareLockKey } from 'src/engine/core-modules/record-share/utils/build-record-share-lock-key.util';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
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
}): Promise<AgentChatThreadWorkspaceEntity> => {
  // generic sharing's lock order, so revocations and writes cannot authorize against different snapshots
  await manager.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [
    buildRecordShareLockKey({
      workspaceId,
      objectMetadataId,
      recordId: threadId,
    }),
  ]);
  const records = await manager.query<AgentChatThreadWorkspaceEntity[]>(
    `SELECT * FROM ${table('agentChatThread')} WHERE id = $1 FOR UPDATE`,
    [threadId],
  );
  if (records.length !== 1) {
    throw new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND);
  }
  return records[0];
};
