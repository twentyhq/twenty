import { buildRecordShareLockKey } from 'src/engine/core-modules/record-share/utils/build-record-share-lock-key.util';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { normalizeAgentHistoryRecord } from 'src/engine/metadata-modules/ai/ai-history/utils/normalize-agent-history-record.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { isNonEmptyString } from '@sniptt/guards';
import { resolveAgentChatThreadOwners } from 'src/engine/metadata-modules/ai/ai-history/utils/resolve-agent-chat-thread-owners.util';

export const lockAgentChatThread = async ({
  context: { manager, table, storage },
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
    `SELECT * FROM ${table('agentChatThread')} WHERE id = $1 ${storage === 'core' ? 'AND "workspaceId" = $2' : ''} FOR UPDATE`,
    storage === 'core' ? [threadId, workspaceId] : [threadId],
  );
  if (records.length !== 1) {
    throw new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND);
  }
  if (storage === 'core') {
    return records[0];
  }
  const thread = normalizeAgentHistoryRecord({
    record: records[0],
    workspaceId,
    objectName: 'agentChatThread',
  });
  if (!('userWorkspaceId' in thread)) {
    const userWorkspaceIdByWorkspaceMemberId =
      await resolveAgentChatThreadOwners({
        manager,
        workspaceId,
        from: 'workspaceMemberId',
        ids: isNonEmptyString(thread.workspaceMemberId)
          ? [thread.workspaceMemberId]
          : [],
      });
    thread.userWorkspaceId =
      userWorkspaceIdByWorkspaceMemberId.get(thread.workspaceMemberId) ?? null;
  }
  return thread as AgentChatThreadEntity;
};
