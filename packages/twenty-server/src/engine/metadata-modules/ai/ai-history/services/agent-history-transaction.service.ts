import { isArray, isString } from '@sniptt/guards';
import { AgentChatDirectMessageRecordsService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-chat-direct-message-records.service';
import { Injectable } from '@nestjs/common';

import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class AgentHistoryTransactionService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly directMessageRecordsService: AgentChatDirectMessageRecordsService,
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

            const standardThreadIds = new Set<string>();
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

                for (const [index, record] of records.entries()) {
                  const recordId = identifiers[index]?.id;
                  if (
                    name === 'agentMessage' &&
                    isString(recordId) &&
                    isString(record.threadId)
                  ) {
                    threadIdsByMessageId.set(recordId, record.threadId);
                  }

                  const messageThreadId =
                    name === 'agentMessagePart' && isString(record.messageId)
                      ? (threadIdsByMessageId.get(record.messageId) ??
                        (
                          await getRepository('agentMessage').findOne({
                            where: { id: record.messageId },
                            select: ['threadId'],
                          })
                        )?.threadId)
                      : undefined;
                  const threadId =
                    name === 'agentChatThread'
                      ? recordId
                      : (messageThreadId ?? record.threadId);

                  if (
                    !isString(recordId) ||
                    !isString(threadId) ||
                    standardThreadIds.has(threadId)
                  ) {
                    continue;
                  }

                  const isDirectMessage =
                    await this.directMessageRecordsService.share({
                      workspaceId,
                      transactionScope,
                      threadId,
                      objectName: name,
                      recordIds: [recordId],
                    });

                  if (!isDirectMessage) {
                    standardThreadIds.add(threadId);
                  }
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
