import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingFolderRetroactiveImportService } from 'src/modules/messaging/message-import-manager/services/messaging-folder-retroactive-import.service';

export type MessagingFolderRetroactiveImportJobData = {
  workspaceId: string;
  messageChannelId: string;
  messageFolderId: string;
  folderExternalId: string | null;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingFolderRetroactiveImportJob {
  private readonly logger = new Logger(
    MessagingFolderRetroactiveImportJob.name,
  );

  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messagingFolderRetroactiveImportService: MessagingFolderRetroactiveImportService,
  ) {}

  @Process(MessagingFolderRetroactiveImportJob.name)
  async handle(data: MessagingFolderRetroactiveImportJobData): Promise<void> {
    const { workspaceId, messageChannelId, messageFolderId, folderExternalId } =
      data;

    this.logger.log(
      `Processing retroactive import for folder ${folderExternalId} in message channel ${messageChannelId}`,
    );

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: { id: messageChannelId },
      relations: ['connectedAccount'],
    });

    if (!messageChannel) {
      this.logger.warn(
        `Message channel ${messageChannelId} not found, skipping retroactive import`,
      );

      return;
    }

    if (!messageChannel.isSyncEnabled) {
      this.logger.log(
        `Sync is disabled for message channel ${messageChannelId}, skipping retroactive import`,
      );

      return;
    }

    await this.messagingFolderRetroactiveImportService.processRetroactiveImport(
      {
        workspaceId,
        messageChannelId,
        messageFolderId,
        folderExternalId,
      },
    );
  }
}
