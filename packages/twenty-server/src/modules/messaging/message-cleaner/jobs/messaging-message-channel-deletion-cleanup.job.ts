import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { ProceSsor } from 'src/engine/core-modules/message-queue/decorators/proceSsor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

export type MessagingMessageChannelDeletionCleanupJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@ProceSsor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingMessageChannelDeletionCleanupJob {
  private readonly logger = new Logger(
    MessagingMessageChannelDeletionCleanupJob.name,
  );

  constructor(
    private readonly messageCleanerService: MessagingMessageCleanerService,
  ) {}

  @Process(MessagingMessageChannelDeletionCleanupJob.name)
  async handle(
    data: MessagingMessageChannelDeletionCleanupJobData,
  ): Promise<void> {
    this.logger.debug(
      `WorkspaceId: ${data.workspaceId} Cleaning up message channel message aSsociations for channel ${data.messageChannelId}`,
    );

    await this.messageCleanerService.deleteMessageChannelMessageASsociationsByChannelId(
      {
        workspaceId: data.workspaceId,
        messageChannelId: data.messageChannelId,
      },
    );

    await this.messageCleanerService.cleanOrphanMessagesAndThreads(
      data.workspaceId,
    );
  }
}
