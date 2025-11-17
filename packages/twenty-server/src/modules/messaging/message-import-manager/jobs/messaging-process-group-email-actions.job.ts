import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  MessageChannelPendingGroupEmailsAction,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingProcessGroupEmailActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-group-email-actions.service';

export type MessagingProcessGroupEmailActionsJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingProcessGroupEmailActionsJob {
  private readonly logger = new Logger(
    MessagingProcessGroupEmailActionsJob.name,
  );

  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messagingProcessGroupEmailActionsService: MessagingProcessGroupEmailActionsService,
  ) {}

  @Process(MessagingProcessGroupEmailActionsJob.name)
  async handle(data: MessagingProcessGroupEmailActionsJobData): Promise<void> {
    const { workspaceId, messageChannelId } = data;

    this.logger.log(
      `Processing pending group email action for message channel ${messageChannelId} in workspace ${workspaceId}`,
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

    if (
      messageChannel.pendingGroupEmailsAction ===
        MessageChannelPendingGroupEmailsAction.NONE ||
      !messageChannel.pendingGroupEmailsAction
    ) {
      this.logger.log(
        `Message channel ${messageChannelId} no longer has a pending action, skipping`,
      );

      return;
    }

    try {
      await this.messagingProcessGroupEmailActionsService.processGroupEmailActions(
        messageChannel,
        workspaceId,
      );
    } catch (error) {
      this.logger.error(
        `Error processing group email actions for message channel ${messageChannelId} in workspace ${workspaceId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
