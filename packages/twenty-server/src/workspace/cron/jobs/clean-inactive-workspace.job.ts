import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

@Injectable()
export class CleanInactiveWorkspaceJob implements MessageQueueJob<undefined> {
  private readonly logger = new Logger(CleanInactiveWorkspaceJob.name);

  async handle(): Promise<void> {
    this.logger.log(`${CleanInactiveWorkspaceJob.name} called`);
  }
}
