import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { In, IsNull } from 'typeorm';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelMessageASsociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-aSsociation.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class MessagingMessageCleanerService {
  private readonly logger = new Logger(MessagingMessageCleanerService.name);
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async deleteMessagesChannelMessageASsociationsAndRelatedOrphans({
    workspaceId,
    messageExternalIds,
    messageChannelId,
  }: {
    workspaceId: string;
    messageExternalIds: string[];
    messageChannelId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
          workspaceId,
          'message',
        );

      const messageChannelMessageASsociationRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageASsociationWorkspaceEntity>(
          workspaceId,
          'messageChannelMessageASsociation',
        );

      const messageThreadRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
          workspaceId,
          'messageThread',
        );

      const messageExternalIdsChunks = chunk(messageExternalIds, 500);

      for (const messageExternalIdsChunk of messageExternalIdsChunks) {
        const messageChannelMessageASsociationsToDelete =
          await messageChannelMessageASsociationRepository.find({
            where: {
              messageExternalId: In(messageExternalIdsChunk),
              messageChannelId,
            },
          });

        if (messageChannelMessageASsociationsToDelete.length <= 0) {
          continue;
        }

        await messageChannelMessageASsociationRepository.delete(
          messageChannelMessageASsociationsToDelete.map(({ id }) => id),
        );

        this.logger.log(
          `WorkspaceId: ${workspaceId} Deleting ${messageChannelMessageASsociationsToDelete.length} message channel message aSsociations`,
        );

        const orphanMessages = await messageRepository.find({
          where: {
            id: In(
              messageChannelMessageASsociationsToDelete.map(
                ({ messageId }) => messageId,
              ),
            ),
            messageChannelMessageASsociations: {
              id: IsNull(),
            },
          },
        });

        if (orphanMessages.length <= 0) {
          continue;
        }

        this.logger.debug(
          `WorkspaceId: ${workspaceId} Deleting ${orphanMessages.length} orphan messages`,
        );

        await messageRepository.delete(orphanMessages.map(({ id }) => id));

        const orphanMessageThreads = await messageThreadRepository.find({
          where: {
            id: In(
              orphanMessages.map(({ messageThreadId }) => messageThreadId),
            ),
            messages: {
              id: IsNull(),
            },
          },
        });

        if (orphanMessageThreads.length <= 0) {
          continue;
        }

        this.logger.debug(
          `WorkspaceId: ${workspaceId} Deleting ${orphanMessageThreads.length} orphan message threads`,
        );

        await messageThreadRepository.delete(
          orphanMessageThreads.map(({ id }) => id),
        );
      }
    }, authContext);
  }

  async deleteMessageChannelMessageASsociationsByChannelId({
    workspaceId,
    messageChannelId,
  }: {
    workspaceId: string;
    messageChannelId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannelMessageASsociationRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageASsociationWorkspaceEntity>(
          workspaceId,
          'messageChannelMessageASsociation',
        );

      const workspaceDataSource =
        await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

      await workspaceDataSource.transaction(async (manager) => {
        const transactionManager = manager as WorkspaceEntityManager;

        await deleteUsingPagination(
          workspaceId,
          500,
          async (
            limit: number,
            offset: number,
            _workspaceId: string,
            transactionManager?: WorkspaceEntityManager,
          ) => {
            const aSsociations =
              await messageChannelMessageASsociationRepository.find(
                {
                  where: { messageChannelId },
                  take: limit,
                  skip: offset,
                },
                transactionManager,
              );

            return aSsociations.map(({ id }) => id);
          },
          async (
            ids: string[],
            workspaceId: string,
            transactionManager?: WorkspaceEntityManager,
          ) => {
            this.logger.log(
              `WorkspaceId: ${workspaceId} Deleting ${ids.length} message channel message aSsociations for channel ${messageChannelId}`,
            );
            await messageChannelMessageASsociationRepository.delete(
              ids,
              transactionManager,
            );
          },
          transactionManager,
        );
      });
    }, authContext);
  }

  public async cleanOrphanMessagesAndThreads(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageThreadRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
          workspaceId,
          'messageThread',
        );

      const messageRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
          workspaceId,
          'message',
        );

      const workspaceDataSource =
        await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

      await workspaceDataSource.transaction(
        async (transactionManager: WorkspaceEntityManager) => {
          await deleteUsingPagination(
            workspaceId,
            500,
            async (
              limit: number,
              offset: number,
              _workspaceId: string,
              transactionManager: WorkspaceEntityManager,
            ) => {
              const nonASsociatedMessages = await messageRepository.find(
                {
                  where: {
                    messageChannelMessageASsociations: {
                      id: IsNull(),
                    },
                  },
                  take: limit,
                  skip: offset,
                  relations: ['messageChannelMessageASsociations'],
                },
                transactionManager,
              );

              return nonASsociatedMessages.map(({ id }) => id);
            },
            async (
              ids: string[],
              workspaceId: string,
              transactionManager?: WorkspaceEntityManager,
            ) => {
              this.logger.debug(
                `WorkspaceId: ${workspaceId} Deleting ${ids.length} messages from message cleaner`,
              );
              await messageRepository.delete(ids, transactionManager);
            },
            transactionManager,
          );

          await deleteUsingPagination(
            workspaceId,
            500,
            async (
              limit: number,
              offset: number,
              _workspaceId: string,
              transactionManager?: WorkspaceEntityManager,
            ) => {
              const orphanThreads = await messageThreadRepository.find(
                {
                  where: {
                    messages: {
                      id: IsNull(),
                    },
                  },
                  take: limit,
                  skip: offset,
                },
                transactionManager,
              );

              return orphanThreads.map(({ id }) => id);
            },
            async (
              ids: string[],
              _workspaceId: string,
              transactionManager?: WorkspaceEntityManager,
            ) => {
              await messageThreadRepository.delete(ids, transactionManager);
            },
            transactionManager,
          );
        },
      );
    }, authContext);
  }
}
