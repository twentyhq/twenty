import { Injectable } from '@nestjs/common';

import { EntityManager, IsNull } from 'typeorm';

import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class MessagingMessageCleanerService {
  constructor(
    @InjectWorkspaceRepository(MessageWorkspaceEntity)
    private readonly messageRepository: WorkspaceRepository<MessageWorkspaceEntity>,
    @InjectWorkspaceRepository(MessageThreadWorkspaceEntity)
    private readonly messageThreadRepository: WorkspaceRepository<MessageThreadWorkspaceEntity>,
  ) {}

  public async cleanWorkspaceThreads(workspaceId: string) {
    await deleteUsingPagination(
      workspaceId,
      500,
      async (
        limit: number,
        offset: number,
        workspaceId: string,
        transactionManager?: EntityManager,
      ) => {
        const nonAssociatedMessages = await this.messageRepository.find(
          {
            where: {
              messageChannelMessageAssociations: IsNull(),
            },
            take: limit,
            skip: offset,
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
        await this.messageRepository.delete(ids, transactionManager);
      },
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
        const orphanThreads = await this.messageThreadRepository.find(
          {
            where: {
              messages: IsNull(),
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
        await this.messageThreadRepository.delete(ids, transactionManager);
      },
    );
  }
}
