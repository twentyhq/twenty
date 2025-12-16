import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { In, IsNull } from 'typeorm';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

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
      authContext,
      async () => {
        const messageRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
            workspaceId,
            'message',
          );

        const messageChannelMessageAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        const messageThreadRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
            workspaceId,
            'messageThread',
          );

        const messageExternalIdsChunks = chunk(messageExternalIds, 500);

        for (const messageExternalIdsChunk of messageExternalIdsChunks) {
          const messageChannelMessageAssociationsToDelete =
            await messageChannelMessageAssociationRepository.find({
              where: {
                messageExternalId: In(messageExternalIdsChunk),
                messageChannelId,
              },
            });

          if (messageChannelMessageAssociationsToDelete.length <= 0) {
            continue;
          }

          await messageChannelMessageAssociationRepository.delete(
            messageChannelMessageAssociationsToDelete.map(({ id }) => id),
          );

          this.logger.log(
            `WorkspaceId: ${workspaceId} Deleting ${messageChannelMessageAssociationsToDelete.length} message channel message associations`,
          );

          const orphanMessages = await messageRepository.find({
            where: {
              id: In(
                messageChannelMessageAssociationsToDelete.map(
                  ({ messageId }) => messageId,
                ),
              ),
              messageChannelMessageAssociations: {
                id: IsNull(),
              },
            },
          });

          if (orphanMessages.length <= 0) {
            continue;
          }

          this.logger.log(
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

          this.logger.log(
            `WorkspaceId: ${workspaceId} Deleting ${orphanMessageThreads.length} orphan message threads`,
          );

          await messageThreadRepository.delete(
            orphanMessageThreads.map(({ id }) => id),
          );
        }
      },
    );
  }

  public async cleanOrphanMessagesAndThreads(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
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
                const nonAssociatedMessages = await messageRepository.find(
                  {
                    where: {
                      messageChannelMessageAssociations: {
                        id: IsNull(),
                      },
                    },
                    take: limit,
                    skip: offset,
                    relations: ['messageChannelMessageAssociations'],
                  },
                  transactionManager,
                );

                return nonAssociatedMessages.map(({ id }) => id);
              },
              async (
                ids: string[],
                workspaceId: string,
                transactionManager?: WorkspaceEntityManager,
              ) => {
                this.logger.log(
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
      },
    );
  }
}
