import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { isArray, isNull, isString } from '@sniptt/guards';
import { AgentChatDirectMessageRecordsService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-chat-direct-message-records.service';
import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class AgentHistoryTransactionService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @Inject(AgentChatDirectMessageRecordsService)
    private readonly directMessageRecordsService: Pick<
      AgentChatDirectMessageRecordsService,
      'isEnabled' | 'share'
    >,
  ) {}

  async run<TResult>(
    workspaceId: string,
    work: (scope: AgentHistoryTransactionScope) => Promise<TResult>,
  ): Promise<TResult> {
    const shouldShareDirectMessageRecords =
      await this.directMessageRecordsService.isEnabled(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          (transactionScope) => {
            const getRepository = (name: AgentHistoryObjectName) =>
              transactionScope.getRepositoryWithoutPermissionChecks(name, {
                shouldSkipEventEmission: true,
              });

            const directMessagePairsByThreadId = new Map<
              string,
              readonly [string, string] | null
            >();
            const threadIdsByMessageId = new Map<string, string>();

            return work({
              executeRawQuery: transactionScope.executeRawQuery,
              insert: async (name, values) => {
                const { identifiers } =
                  await getRepository(name).insert(values);
                if (!shouldShareDirectMessageRecords) {
                  return;
                }

                const records = isArray(values) ? values : [values];

                const missingMessageIds = [
                  ...new Set(
                    records.map(({ messageId }) => messageId).filter(isString),
                  ),
                ].filter((messageId) => !threadIdsByMessageId.has(messageId));

                if (isNonEmptyArray(missingMessageIds)) {
                  const messages = await transactionScope
                    .getRepositoryWithoutPermissionChecks<AgentMessageWorkspaceEntity>(
                      'agentMessage',
                      { shouldSkipEventEmission: true },
                    )
                    .find({
                      where: { id: In(missingMessageIds) },
                      select: ['id', 'threadId'],
                      withDeleted: true,
                    });

                  for (const message of messages) {
                    threadIdsByMessageId.set(message.id, message.threadId);
                  }
                }

                const recordIdsByThreadId = new Map<string, string[]>();

                for (const [index, record] of records.entries()) {
                  const recordId = identifiers[index]?.id;
                  let threadId = record.threadId;

                  if (name === 'agentChatThread') {
                    threadId = recordId;
                  }

                  if (
                    name === 'agentMessagePart' &&
                    isString(record.messageId)
                  ) {
                    threadId = threadIdsByMessageId.get(record.messageId);
                  }

                  if (name === 'agentTurn' && isNull(threadId)) {
                    continue;
                  }

                  if (!isString(recordId) || !isString(threadId)) {
                    return throwAgentChatThreadNotFound();
                  }

                  if (name === 'agentMessage') {
                    threadIdsByMessageId.set(recordId, threadId);
                  }

                  const recordIds = recordIdsByThreadId.get(threadId) ?? [];

                  recordIds.push(recordId);
                  recordIdsByThreadId.set(threadId, recordIds);
                }

                for (const [threadId, recordIds] of recordIdsByThreadId) {
                  await this.directMessageRecordsService.share({
                    workspaceId,
                    transactionScope,
                    threadId,
                    objectName: name,
                    recordIds,
                    directMessagePairsByThreadId,
                  });
                }
              },
              update: async (name, where, values) => {
                const result = await getRepository(name).update(where, values);

                return result.generatedMaps.length;
              },
              upsert: async (name, values, conflictPaths) => {
                // workspace upsert selects before inserting, so concurrent writers of one identity take turns
                const identity = [...conflictPaths]
                  .sort()
                  .map((field) => [field, values[field]]);

                await transactionScope.executeRawQuery(
                  'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
                  [
                    `agent-history-upsert:${workspaceId}:${name}:${JSON.stringify(identity)}`,
                  ],
                );
                await getRepository(name).upsert(values, conflictPaths);
              },
              delete: async (name, where) => {
                await getRepository(name).delete(where);
              },
              afterCommit: transactionScope.afterCommit,
            });
          },
        ),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}
