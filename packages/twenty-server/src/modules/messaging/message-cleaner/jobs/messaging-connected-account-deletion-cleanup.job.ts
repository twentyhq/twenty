import { Logger, Scope } from '@nestjs/common';

import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';

export type MessagingConnectedAccountDeletionCleanupJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingConnectedAccountDeletionCleanupJob {
  private readonly logger = new Logger(
    MessagingConnectedAccountDeletionCleanupJob.name,
  );

  constructor(
    private readonly messageCleanerService: MessagingMessageCleanerService,
  ) {}

  @Process(MessagingConnectedAccountDeletionCleanupJob.name)
  async handle(
    data: MessagingConnectedAccountDeletionCleanupJobData,
  ): Promise<void> {
    this.logger.log(
      `Deleting connected account ${data.connectedAccountId} associated messaging data in workspace ${data.workspaceId}`,
    );

    await this.messageCleanerService.cleanWorkspaceThreads(data.workspaceId);

    this.logger.log(
      `Deleted connected account ${data.connectedAccountId} associated messaging data in workspace ${data.workspaceId}`,
    );
  }
}
