import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

const ORPHAN_CLEANUP_PAGE_SIZE = 500;

@Injectable()
export class MessagingMessageCleanerService {
  private readonly logger = new Logger(MessagingMessageCleanerService.name);
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly participantTargetReconciliationService: ParticipantTargetReconciliationService,
  ) {}

  async deleteMessagesChannelMessageAssociationsAndRelatedOrphans({
    workspaceId,
    messageExternalIds,
    messageChannelId,
  }: {
    workspaceId: string;
    messageExternalIds: string[];
    messageChannelId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const messageRepository =
              transactionScope.getRepository<MessageWorkspaceEntity>(
                'message',
                { shouldBypassPermissionChecks: true },
              );
            const messageChannelMessageAssociationRepository =
              transactionScope.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
                'messageChannelMessageAssociation',
                { shouldBypassPermissionChecks: true },
              );
            const messageThreadRepository =
              transactionScope.getRepository<MessageThreadWorkspaceEntity>(
                'messageThread',
                { shouldBypassPermissionChecks: true },
              );

            for (const messageExternalIdsChunk of chunk(
              messageExternalIds,
              500,
            )) {
              const associationsToDelete =
                await messageChannelMessageAssociationRepository.find({
                  where: {
                    messageExternalId: In(messageExternalIdsChunk),
                    messageChannelId,
                  },
                });

              if (associationsToDelete.length <= 0) {
                continue;
              }

              await messageChannelMessageAssociationRepository.delete(
                associationsToDelete.map(({ id }) => id),
              );

              this.logger.log(
                `WorkspaceId: ${workspaceId} Deleting ${associationsToDelete.length} message channel message associations`,
              );

              const candidateMessageIds = [
                ...new Set(
                  associationsToDelete.map(({ messageId }) => messageId),
                ),
              ];

              const orphanMessageIds = await this.filterOrphans(
                candidateMessageIds,
                (messageIds) =>
                  this.findReferencedMessageIds(
                    messageChannelMessageAssociationRepository,
                    messageIds,
                  ),
              );

              if (orphanMessageIds.length <= 0) {
                continue;
              }

              const orphanMessages = await messageRepository.find({
                where: { id: In(orphanMessageIds) },
              });

              await messageRepository.delete(orphanMessageIds);

              const candidateThreadIds = [
                ...new Set(
                  orphanMessages
                    .map(({ messageThreadId }) => messageThreadId)
                    .filter(isDefined),
                ),
              ];

              const orphanThreadIds = await this.filterOrphans(
                candidateThreadIds,
                (threadIds) =>
                  this.findReferencedThreadIds(messageRepository, threadIds),
              );

              if (orphanThreadIds.length > 0) {
                await messageThreadRepository.delete(orphanThreadIds);
              }

              await this.participantTargetReconciliationService.reconcileMessageThreadTargets(
                {
                  messageThreadIds: candidateThreadIds.filter(
                    (threadId) => !orphanThreadIds.includes(threadId),
                  ),
                  transactionScope,
                },
              );
            }
          },
        );
      },
      authContext,
      { lite: true },
    );
  }

  async deleteMessageChannelMessageAssociationsByChannelId({
    workspaceId,
    messageChannelId,
  }: {
    workspaceId: string;
    messageChannelId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        let deletedAssociationCount: number;

        do {
          deletedAssociationCount =
            await this.workspaceOrmManager.runInWorkspaceTransaction(
              async (transactionScope) => {
                const messageChannelMessageAssociationRepository =
                  transactionScope.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
                    'messageChannelMessageAssociation',
                    { shouldBypassPermissionChecks: true },
                  );

                const associations =
                  await messageChannelMessageAssociationRepository.find({
                    where: { messageChannelId },
                    take: ORPHAN_CLEANUP_PAGE_SIZE,
                    select: { id: true },
                  });

                if (associations.length === 0) {
                  return 0;
                }

                const ids = associations.map(({ id }) => id);

                this.logger.log(
                  `WorkspaceId: ${workspaceId} Deleting ${ids.length} message channel message associations for channel ${messageChannelId}`,
                );

                await messageChannelMessageAssociationRepository.delete(ids);

                return ids.length;
              },
            );
        } while (deletedAssociationCount > 0);
      },
      authContext,
      { lite: true },
    );
  }

  public async cleanOrphanMessagesAndThreads(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.deleteOrphansByKeyset((transactionScope, cursor) =>
          this.deleteOrphanMessagesOfNextPage(transactionScope, cursor),
        );

        await this.deleteOrphansByKeyset((transactionScope, cursor) =>
          this.deleteOrphanThreadsOfNextPage(transactionScope, cursor),
        );
      },
      authContext,
      { lite: true },
    );
  }

  private async deleteOrphanMessagesOfNextPage(
    transactionScope: WorkspaceTransactionScope,
    cursor: string | undefined,
  ): Promise<string | undefined> {
    const messageRepository =
      transactionScope.getRepository<MessageWorkspaceEntity>('message', {
        shouldBypassPermissionChecks: true,
      });
    const messageChannelMessageAssociationRepository =
      transactionScope.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        'messageChannelMessageAssociation',
        { shouldBypassPermissionChecks: true },
      );

    const page = await messageRepository.find({
      where: isDefined(cursor) ? { id: MoreThan(cursor) } : {},
      order: { id: 'ASC' },
      take: ORPHAN_CLEANUP_PAGE_SIZE,
      select: { id: true },
    });

    if (page.length === 0) {
      return undefined;
    }

    const pageIds = page.map(({ id }) => id);

    const orphanMessageIds = await this.filterOrphans(pageIds, (ids) =>
      this.findReferencedMessageIds(
        messageChannelMessageAssociationRepository,
        ids,
      ),
    );

    if (orphanMessageIds.length > 0) {
      const messagesToDelete = await messageRepository.find({
        where: { id: In(orphanMessageIds) },
        select: { messageThreadId: true },
      });
      const candidateThreadIds = [
        ...new Set(
          messagesToDelete
            .map(({ messageThreadId }) => messageThreadId)
            .filter(isDefined),
        ),
      ];

      await messageRepository.delete(orphanMessageIds);

      const survivingThreadIds = await this.findReferencedThreadIds(
        messageRepository,
        candidateThreadIds,
      );

      await this.participantTargetReconciliationService.reconcileMessageThreadTargets(
        {
          messageThreadIds: survivingThreadIds,
          transactionScope,
        },
      );
    }

    return pageIds[pageIds.length - 1];
  }

  private async deleteOrphanThreadsOfNextPage(
    transactionScope: WorkspaceTransactionScope,
    cursor: string | undefined,
  ): Promise<string | undefined> {
    const messageThreadRepository =
      transactionScope.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
        { shouldBypassPermissionChecks: true },
      );
    const messageRepository =
      transactionScope.getRepository<MessageWorkspaceEntity>('message', {
        shouldBypassPermissionChecks: true,
      });

    const page = await messageThreadRepository.find({
      where: isDefined(cursor) ? { id: MoreThan(cursor) } : {},
      order: { id: 'ASC' },
      take: ORPHAN_CLEANUP_PAGE_SIZE,
      select: { id: true },
    });

    if (page.length === 0) {
      return undefined;
    }

    const pageIds = page.map(({ id }) => id);

    const orphanThreadIds = await this.filterOrphans(pageIds, (ids) =>
      this.findReferencedThreadIds(messageRepository, ids),
    );

    if (orphanThreadIds.length > 0) {
      await messageThreadRepository.delete(orphanThreadIds);
    }

    return pageIds[pageIds.length - 1];
  }

  private async findReferencedMessageIds(
    messageChannelMessageAssociationRepository: WorkspaceRepository<MessageChannelMessageAssociationWorkspaceEntity>,
    messageIds: string[],
  ): Promise<string[]> {
    const associations = await messageChannelMessageAssociationRepository.find({
      where: { messageId: In(messageIds) },
      select: { messageId: true },
    });

    return associations.map(({ messageId }) => messageId);
  }

  private async findReferencedThreadIds(
    messageRepository: WorkspaceRepository<MessageWorkspaceEntity>,
    threadIds: string[],
  ): Promise<string[]> {
    if (threadIds.length === 0) {
      return [];
    }

    const messages = await messageRepository.find({
      where: { messageThreadId: In(threadIds) },
      select: { messageThreadId: true },
    });

    return messages
      .map(({ messageThreadId }) => messageThreadId)
      .filter(isDefined);
  }

  private async filterOrphans(
    parentIds: string[],
    findReferencedParentIds: (parentIds: string[]) => Promise<string[]>,
  ): Promise<string[]> {
    if (parentIds.length === 0) {
      return [];
    }

    const referencedParentIds = new Set(
      await findReferencedParentIds(parentIds),
    );

    return parentIds.filter((parentId) => !referencedParentIds.has(parentId));
  }

  private async deleteOrphansByKeyset(
    deleteOrphansOfNextPage: (
      transactionScope: WorkspaceTransactionScope,
      cursor: string | undefined,
    ) => Promise<string | undefined>,
  ): Promise<void> {
    let cursor: string | undefined;

    do {
      cursor = await this.workspaceOrmManager.runInWorkspaceTransaction(
        (transactionScope) => deleteOrphansOfNextPage(transactionScope, cursor),
      );
    } while (isDefined(cursor));
  }
}
