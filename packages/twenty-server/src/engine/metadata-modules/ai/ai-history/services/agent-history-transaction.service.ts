import { Inject, Injectable } from '@nestjs/common';
import { isString } from '@sniptt/guards';
import { type ObjectLiteral } from 'typeorm';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { AgentChatDirectMessageConversationPrivacyService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-chat-direct-message-conversation-privacy.service';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { deleteAgentHistoryRecordsWithShares } from 'src/engine/metadata-modules/ai/ai-history/utils/delete-agent-history-records-with-shares.util';
import { validateAgentHistoryConversationRecordsOrThrow } from 'src/engine/metadata-modules/ai/ai-history/utils/validate-agent-history-conversation-records-or-throw.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

@Injectable()
export class AgentHistoryTransactionService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @Inject(AgentChatDirectMessageConversationPrivacyService)
    private readonly directMessageConversationPrivacyService: Pick<
      AgentChatDirectMessageConversationPrivacyService,
      | 'findDirectMessagePairOfThread'
      | 'makeConversationRecordsPrivateToPair'
      | 'deletePairSharesOfConversationRecords'
    >,
  ) {}

  async run<TResult>({
    workspaceId,
    threadId,
    work,
  }: {
    workspaceId: string;
    threadId: string | null;
    work: (scope: AgentHistoryTransactionScope) => Promise<TResult>;
  }): Promise<TResult> {
    return this.workspaceOrmManager.executeTransactionInWorkspaceContext(
      (transactionScope) => {
        const getRepository = (name: AgentHistoryObjectName) =>
          transactionScope.getRepositoryWithoutPermissionChecks(name, {
            shouldSkipEventEmission: true,
          });

        const writtenMessageIds = new Set<string>();
        let directMessagePair: Promise<readonly [string, string] | null>;

        const resolveDirectMessagePair = () => {
          directMessagePair ??= isDefined(threadId)
            ? this.directMessageConversationPrivacyService.findDirectMessagePairOfThread(
                { workspaceId, transactionScope, threadId },
              )
            : Promise.resolve(null);

          return directMessagePair;
        };

        const shareInsertedRecords = async ({
          name,
          identifiers,
        }: {
          name: AgentHistoryObjectName;
          identifiers: ObjectLiteral[];
        }) => {
          const recordIds = identifiers.map(({ id }) => {
            if (!isString(id)) {
              throw new AgentHistoryStorageException({
                code: 'INVALID_RECORD_IDENTIFIER',
                message: doNotTranslate(
                  `Agent history ${name} write returned a non-string record ID`,
                ),
              });
            }

            return id;
          });

          if (name === 'agentMessage') {
            for (const recordId of recordIds) {
              writtenMessageIds.add(recordId.toLowerCase());
            }
          }

          const pair = await resolveDirectMessagePair();

          if (!isDefined(pair)) {
            return;
          }

          await this.directMessageConversationPrivacyService.makeConversationRecordsPrivateToPair(
            {
              workspaceId,
              transactionScope,
              pair,
              conversationObjectName: name,
              conversationRecordIds: recordIds,
            },
          );
        };

        return work({
          threadId,
          executeRawQuery: transactionScope.executeRawQuery,
          insert: async ({ name, values }) => {
            validateAgentHistoryConversationRecordsOrThrow({
              name,
              values,
              threadId,
              writtenMessageIds,
            });

            const { identifiers } = await getRepository(name).insert(values);

            await shareInsertedRecords({ name, identifiers });
          },
          update: async ({ name, where, values }) => {
            const result = await getRepository(name).update(where, values);

            return result.generatedMaps.length;
          },
          upsert: async ({ name, values, conflictPaths }) => {
            const normalizedValues = { ...values };

            if (isString(normalizedValues.id)) {
              normalizedValues.id = normalizedValues.id.toLowerCase();
            }

            validateAgentHistoryConversationRecordsOrThrow({
              name,
              values: normalizedValues,
              threadId,
              writtenMessageIds,
            });

            const identity = [...conflictPaths]
              .sort()
              .map((field) => [field, normalizedValues[field]]);

            await transactionScope.executeRawQuery(
              'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
              [
                `agent-history-upsert:${workspaceId}:${name}:${JSON.stringify(identity)}`,
              ],
            );

            const { identifiers } = await getRepository(name).upsert(
              normalizedValues,
              conflictPaths,
            );

            await shareInsertedRecords({ name, identifiers });
          },
          delete: async ({ name, where }) => {
            const pair = await resolveDirectMessagePair();

            if (!isDefined(pair)) {
              const { raw } = await getRepository(name).delete(where);

              return raw.length;
            }

            return deleteAgentHistoryRecordsWithShares({
              workspaceId,
              transactionScope,
              name,
              where,
              deleteShares: (records) =>
                this.directMessageConversationPrivacyService.deletePairSharesOfConversationRecords(
                  { workspaceId, transactionScope, ...records },
                ),
            });
          },
          afterCommit: transactionScope.afterCommit,
        });
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}
