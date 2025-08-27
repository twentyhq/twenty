import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncMessageFoldersService } from 'src/modules/messaging/folder-sync-manager/services/sync-message-folders.service';

export type MessagingFolderSyncJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingFolderSyncJob {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly syncMessageFoldersService: SyncMessageFoldersService,
  ) {}

  @Process(MessagingFolderSyncJob.name)
  async handle(data: MessagingFolderSyncJobData): Promise<void> {
    const { workspaceId, messageChannelId } = data;

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    await this.syncMessageFoldersService.syncMessageFolders({
      workspaceId,
      messageChannelId,
      manager: workspaceDataSource.manager,
    });
  }
}
