import { Injectable } from '@nestjs/common';

import { IsNull } from 'typeorm';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
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
  }
}
