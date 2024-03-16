import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { ThreadCleanerService } from 'src/modules/messaging/services/thread-cleaner/thread-cleaner.service';

export type DeleteConnectedAccountAssociatedMessagingDataJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class DeleteConnectedAccountAssociatedMessagingDataJob
  implements
    MessageQueueJob<DeleteConnectedAccountAssociatedMessagingDataJobData>
{
  private readonly logger = new Logger(
    DeleteConnectedAccountAssociatedMessagingDataJob.name,
  );

  constructor(private readonly threadCleanerService: ThreadCleanerService) {}

  async handle(
    data: DeleteConnectedAccountAssociatedMessagingDataJobData,
  ): Promise<void> {
    this.logger.log(
      `Deleting connected account ${data.connectedAccountId} associated messaging data in workspace ${data.workspaceId}`,
    );

    await this.threadCleanerService.cleanWorkspaceThreads(data.workspaceId);

    this.logger.log(
      `Deleted connected account ${data.connectedAccountId} associated messaging data in workspace ${data.workspaceId}`,
    );
  }
}
