import { Injectable } from '@nestjs/common';

import { EntityManager, IsNull } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class MessagingMessageCleanerService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  public async cleanWorkspaceThreads(workspaceId: string) {
    const messageThreadRepository =
      await this.twentyORMManager.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
      );

    const messageRepository =
      await this.twentyORMManager.getRepository<MessageWorkspaceEntity>(
        'message',
      );

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

    await workspaceDataSource.transaction(async (transactionManager) => {
      await deleteUsingPagination(
        workspaceId,
        500,
        async (
          limit: number,
          offset: number,
          workspaceId: string,
          transactionManager: EntityManager,
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
          transactionManager?: EntityManager,
        ) => {
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
          workspaceId: string,
          transactionManager?: EntityManager,
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
          workspaceId: string,
          transactionManager?: EntityManager,
        ) => {
          await messageThreadRepository.delete(ids, transactionManager);
        },
        transactionManager,
      );
    });
  }
}
