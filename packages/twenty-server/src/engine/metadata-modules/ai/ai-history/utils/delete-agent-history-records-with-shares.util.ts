import { In, type ObjectLiteral } from 'typeorm';
import { type InboxObjectNamesByLegacyName } from 'twenty-shared/ai';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { getWorkspaceAgentHistoryTable } from 'src/engine/metadata-modules/ai/ai-history/utils/get-workspace-agent-history-table.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

export const deleteAgentHistoryRecordsWithShares = async ({
  workspaceId,
  transactionScope,
  inboxObjectNamesByLegacyName,
  name,
  where,
  deleteShares,
}: {
  workspaceId: string;
  transactionScope: WorkspaceTransactionScope;
  inboxObjectNamesByLegacyName: InboxObjectNamesByLegacyName;
  name: AgentHistoryObjectName;
  where: ObjectLiteral;
  deleteShares: (records: {
    conversationObjectName: AgentHistoryObjectName;
    conversationRecordIds: string[];
  }) => Promise<void>;
}): Promise<number> => {
  const repository = transactionScope.getRepositoryWithoutPermissionChecks(
    inboxObjectNamesByLegacyName[name],
    { shouldSkipEventEmission: true },
  );

  const candidates = await repository.find({
    where,
    select: ['id'],
    withDeleted: true,
  });

  if (!isNonEmptyArray(candidates)) {
    return 0;
  }

  const candidateIds = candidates.map(({ id }) => id);

  const table = getWorkspaceAgentHistoryTable(workspaceId);

  await transactionScope.executeRawQuery(
    `SELECT id FROM ${table(inboxObjectNamesByLegacyName[name])} WHERE id = ANY($1::uuid[]) ORDER BY id FOR UPDATE`,
    [candidateIds],
  );

  const records = await repository.find({
    where: { ...where, id: In(candidateIds) },
    select: ['id'],
    withDeleted: true,
  });

  if (!isNonEmptyArray(records)) {
    return 0;
  }

  const recordIds = records.map(({ id }) => id);

  if (name === 'agentChatThread') {
    await deleteAgentHistoryRecordsWithShares({
      workspaceId,
      transactionScope,
      inboxObjectNamesByLegacyName,
      name: 'agentTurn',
      where: { threadId: In(recordIds) },
      deleteShares,
    });
  }

  if (name === 'agentChatThread' || name === 'agentTurn') {
    await deleteAgentHistoryRecordsWithShares({
      workspaceId,
      transactionScope,
      inboxObjectNamesByLegacyName,
      name: 'agentMessage',
      where:
        name === 'agentChatThread'
          ? { threadId: In(recordIds) }
          : { turnId: In(recordIds) },
      deleteShares,
    });
  }

  if (name === 'agentMessage') {
    const { raw: deletedParts } = await transactionScope
      .getRepositoryWithoutPermissionChecks(
        inboxObjectNamesByLegacyName.agentMessagePart,
        {
          shouldSkipEventEmission: true,
        },
      )
      .delete({ messageId: In(recordIds) });

    await deleteShares({
      conversationObjectName: 'agentMessagePart',
      conversationRecordIds: deletedParts.map(({ id }: { id: string }) => id),
    });
  }

  const { raw } = await repository.delete({ id: In(recordIds) });

  await deleteShares({
    conversationObjectName: name,
    conversationRecordIds: raw.map(({ id }: { id: string }) => id),
  });

  return raw.length;
};
