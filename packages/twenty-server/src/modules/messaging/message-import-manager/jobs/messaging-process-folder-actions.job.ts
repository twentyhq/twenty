import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  type MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingProcessFolderActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-folder-actions.service';

export type MessagingProcessFolderActionsJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingProcessFolderActionsJob {
  private readonly logger = new Logger(MessagingProcessFolderActionsJob.name);

  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messagingProcessFolderActionsService: MessagingProcessFolderActionsService,
  ) {}

  @Process(MessagingProcessFolderActionsJob.name)
  async handle(data: MessagingProcessFolderActionsJobData): Promise<void> {
    const { workspaceId, messageChannelId } = data;

    this.logger.log(
      `Processing pending folder actions for message channel ${messageChannelId} in workspace ${workspaceId}`,
    );

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: {
        id: messageChannelId,
      },
    });

    if (!messageChannel) {
      this.logger.warn(
        `Message channel ${messageChannelId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const messageFolderRepository =
      await this.twentyORMManager.getRepository<MessageFolderWorkspaceEntity>(
        'messageFolder',
      );

    const messageFolders = await messageFolderRepository.find({
      where: {
        messageChannelId: messageChannel.id,
        pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION,
      },
    });

    if (messageFolders.length === 0) {
      this.logger.log(
        `Message channel ${messageChannelId} has no folders with pending deletion actions, skipping`,
      );

      return;
    }

    try {
      await this.messagingProcessFolderActionsService.processFolderActions(
        messageChannel,
        messageFolders,
        workspaceId,
      );
    } catch (error) {
      this.logger.error(
        `Error processing folder actions for message channel ${messageChannelId} in workspace ${workspaceId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
