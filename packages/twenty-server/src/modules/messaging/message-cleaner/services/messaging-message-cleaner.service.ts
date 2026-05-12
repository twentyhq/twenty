import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { In, IsNull, Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Injectable()
export class MessagingMessageCleanerService {
  private readonly logger = new Logger(MessagingMessageCleanerService.name);
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  private async resolveMessageAndThreadObjectMetadataIds(workspaceId: string) {
    const [messageObjectMetadata, messageThreadObjectMetadata] =
      await Promise.all([
        this.objectMetadataRepository.findOne({
          where: { nameSingular: 'message', workspaceId },
        }),
        this.objectMetadataRepository.findOne({
          where: { nameSingular: 'messageThread', workspaceId },
        }),
      ]);

    return {
      messageObjectMetadataId: messageObjectMetadata?.id ?? null,
      messageThreadObjectMetadataId: messageThreadObjectMetadata?.id ?? null,
    };
  }

  private async deleteTimelineActivitiesForLinkedRecords({
    workspaceId,
    linkedObjectMetadataId,
    linkedRecordIds,
    transactionManager,
  }: {
    workspaceId: string;
    linkedObjectMetadataId: string | null;
    linkedRecordIds: string[];
    transactionManager?: WorkspaceEntityManager;
  }) {
    if (!linkedObjectMetadataId || linkedRecordIds.length === 0) {
      return;
    }

    const timelineActivityRepository =
      await this.globalWorkspaceOrmManager.getRepository<TimelineActivityWorkspaceEntity>(
        workspaceId,
        'timelineActivity',
        { shouldBypassPermissionChecks: true },
      );

    await timelineActivityRepository.delete(
      {
        linkedObjectMetadataId,
        linkedRecordId: In(linkedRecordIds),
      },
      transactionManager,
    );
  }

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

    const { messageObjectMetadataId, messageThreadObjectMetadataId } =
      await this.resolveMessageAndThreadObjectMetadataIds(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
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

        this.logger.debug(
          `WorkspaceId: ${workspaceId} Deleting ${orphanMessages.length} orphan messages`,
        );

        const orphanMessageIds = orphanMessages.map(({ id }) => id);

        await this.deleteTimelineActivitiesForLinkedRecords({
          workspaceId,
          linkedObjectMetadataId: messageObjectMetadataId,
          linkedRecordIds: orphanMessageIds,
        });

        await messageRepository.delete(orphanMessageIds);

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

        const orphanMessageThreadIds = orphanMessageThreads.map(({ id }) => id);

        await this.deleteTimelineActivitiesForLinkedRecords({
          workspaceId,
          linkedObjectMetadataId: messageThreadObjectMetadataId,
          linkedRecordIds: orphanMessageThreadIds,
        });

        await messageThreadRepository.delete(orphanMessageThreadIds);
      }
    }, authContext);
  }

  async deleteMessageChannelMessageAssociationsByChannelId({
    workspaceId,
    messageChannelId,
  }: {
    workspaceId: string;
    messageChannelId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannelMessageAssociationRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
          workspaceId,
          'messageChannelMessageAssociation',
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
            const associations =
              await messageChannelMessageAssociationRepository.find(
                {
                  where: { messageChannelId },
                  take: limit,
                  skip: offset,
                },
                transactionManager,
              );

            return associations.map(({ id }) => id);
          },
          async (
            ids: string[],
            workspaceId: string,
            transactionManager?: WorkspaceEntityManager,
          ) => {
            this.logger.log(
              `WorkspaceId: ${workspaceId} Deleting ${ids.length} message channel message associations for channel ${messageChannelId}`,
            );
            await messageChannelMessageAssociationRepository.delete(
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

    const { messageObjectMetadataId, messageThreadObjectMetadataId } =
      await this.resolveMessageAndThreadObjectMetadataIds(workspaceId);

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
              this.logger.debug(
                `WorkspaceId: ${workspaceId} Deleting ${ids.length} messages from message cleaner`,
              );
              await this.deleteTimelineActivitiesForLinkedRecords({
                workspaceId,
                linkedObjectMetadataId: messageObjectMetadataId,
                linkedRecordIds: ids,
                transactionManager,
              });
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
              await this.deleteTimelineActivitiesForLinkedRecords({
                workspaceId,
                linkedObjectMetadataId: messageThreadObjectMetadataId,
                linkedRecordIds: ids,
                transactionManager,
              });
              await messageThreadRepository.delete(ids, transactionManager);
            },
            transactionManager,
          );
        },
      );
    }, authContext);
  }
}
