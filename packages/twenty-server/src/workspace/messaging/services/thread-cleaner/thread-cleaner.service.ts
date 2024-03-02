import { Injectable } from '@nestjs/common';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { MessageThreadService } from 'src/workspace/messaging/repositories/message-thread/message-thread.service';
import { MessageService } from 'src/workspace/messaging/repositories/message/message.service';

@Injectable()
export class ThreadCleanerService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly messageService: MessageService,
    private readonly messageThreadService: MessageThreadService,
  ) {}

  public async cleanWorkspaceThreads(workspaceId: string) {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    await workspaceDataSource?.transaction(async (transactionManager) => {
      const messagesToDelete =
        await this.messageService.getNonAssociatedMessages(
          workspaceId,
          transactionManager,
        );

      const messageIdsToDelete = messagesToDelete.map(({ id }) => id);

      if (messageIdsToDelete.length > 0) {
        await this.messageService.deleteByIds(
          messageIdsToDelete,
          workspaceId,
          transactionManager,
        );
      }

      const messageThreadsToDelete =
        await this.messageThreadService.getOrphanThreads(
          workspaceId,
          transactionManager,
        );

      const messageThreadToDeleteIds = messageThreadsToDelete.map(
        ({ id }) => id,
      );

      if (messageThreadToDeleteIds.length > 0) {
        await this.messageThreadService.deleteByIds(
          messageThreadToDeleteIds,
          workspaceId,
          transactionManager,
        );
      }
    });
  }
}
