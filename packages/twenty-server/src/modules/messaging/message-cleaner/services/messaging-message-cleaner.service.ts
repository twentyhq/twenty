import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

const ORPHAN_CLEANUP_PAGE_SIZE = 500;

@Injectable()
export class MessagingMessageCleanerService {
  private readonly logger = new Logger(MessagingMessageCleanerService.name);
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.globalWorkspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const messageRepository =
              transactionScope.getRepository<MessageWorkspaceEntity>('message');
            const messageChannelMessageAssociationRepository =
              transactionScope.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
                'messageChannelMessageAssociation',
              );
            const messageThreadRepository =
              transactionScope.getRepository<MessageThreadWorkspaceEntity>(
                'messageThread',
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

              if (orphanThreadIds.length <= 0) {
                continue;
              }

              await messageThreadRepository.delete(orphanThreadIds);
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.globalWorkspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const messageChannelMessageAssociationRepository =
              transactionScope.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
                'messageChannelMessageAssociation',
              );

            for (;;) {
              const associations =
                await messageChannelMessageAssociationRepository.find({
                  where: { messageChannelId },
                  take: ORPHAN_CLEANUP_PAGE_SIZE,
                  select: { id: true },
                });

              if (associations.length === 0) {
                break;
              }

              const ids = associations.map(({ id }) => id);

              this.logger.log(
                `WorkspaceId: ${workspaceId} Deleting ${ids.length} message channel message associations for channel ${messageChannelId}`,
              );

              await messageChannelMessageAssociationRepository.delete(ids);
            }
          },
        );
      },
      authContext,
      { lite: true },
    );
  }

  public async cleanOrphanMessagesAndThreads(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.globalWorkspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const messageThreadRepository =
              transactionScope.getRepository<MessageThreadWorkspaceEntity>(
                'messageThread',
              );
            const messageRepository =
              transactionScope.getRepository<MessageWorkspaceEntity>('message');
            const messageChannelMessageAssociationRepository =
              transactionScope.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
                'messageChannelMessageAssociation',
              );

            await this.deleteOrphansByKeyset(
              async (cursor) => {
                const page = await messageRepository.find({
                  where: isDefined(cursor) ? { id: MoreThan(cursor) } : {},
                  order: { id: 'ASC' },
                  take: ORPHAN_CLEANUP_PAGE_SIZE,
                  select: { id: true },
                });

                return page.map(({ id }) => id);
              },
              (ids) => messageRepository.delete(ids),
              (pageIds) =>
                this.filterOrphans(pageIds, (ids) =>
                  this.findReferencedMessageIds(
                    messageChannelMessageAssociationRepository,
                    ids,
                  ),
                ),
            );

            await this.deleteOrphansByKeyset(
              async (cursor) => {
                const page = await messageThreadRepository.find({
                  where: isDefined(cursor) ? { id: MoreThan(cursor) } : {},
                  order: { id: 'ASC' },
                  take: ORPHAN_CLEANUP_PAGE_SIZE,
                  select: { id: true },
                });

                return page.map(({ id }) => id);
              },
              (ids) => messageThreadRepository.delete(ids),
              (pageIds) =>
                this.filterOrphans(pageIds, (ids) =>
                  this.findReferencedThreadIds(messageRepository, ids),
                ),
            );
          },
        );
      },
      authContext,
      { lite: true },
    );
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
    fetchPageIds: (cursor: string | undefined) => Promise<string[]>,
    deleteByIds: (ids: string[]) => Promise<unknown>,
    findOrphanIds: (pageIds: string[]) => Promise<string[]>,
  ): Promise<void> {
    let cursor: string | undefined;

    for (;;) {
      const pageIds = await fetchPageIds(cursor);

      if (pageIds.length === 0) {
        break;
      }

      cursor = pageIds[pageIds.length - 1];

      const orphanIds = await findOrphanIds(pageIds);

      if (orphanIds.length > 0) {
        await deleteByIds(orphanIds);
      }
    }
  }
}
