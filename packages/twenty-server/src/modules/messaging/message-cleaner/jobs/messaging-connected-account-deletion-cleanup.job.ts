import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

export type MessagingConnectedAccountDeletionCleanupJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class MessagingConnectedAccountDeletionCleanupJob
  implements MessageQueueJob<MessagingConnectedAccountDeletionCleanupJobData>
{
  private readonly logger = new Logger(
    MessagingConnectedAccountDeletionCleanupJob.name,
  );

  constructor(
    private readonly messageCleanerService: MessagingMessageCleanerService,
  ) {}

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
