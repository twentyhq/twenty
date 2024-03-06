import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { ThreadCleanerService } from 'src/workspace/messaging/services/thread-cleaner/thread-cleaner.service';

export type DeleteConnectedAccountAssociatedDataJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class DeleteConnectedAccountAssociatedDataJob
  implements MessageQueueJob<DeleteConnectedAccountAssociatedDataJobData>
{
  private readonly logger = new Logger(
    DeleteConnectedAccountAssociatedDataJob.name,
  );

  constructor(private readonly threadCleanerService: ThreadCleanerService) {}

  async handle(
    data: DeleteConnectedAccountAssociatedDataJobData,
  ): Promise<void> {
    this.logger.log(
      `Deleting connected account ${data.connectedAccountId} associated data in workspace ${data.workspaceId}`,
    );

    await this.threadCleanerService.cleanWorkspaceThreads(data.workspaceId);

    this.logger.log(
      `Deleted connected account ${data.connectedAccountId} associated data in workspace ${data.workspaceId}`,
    );
  }
}
