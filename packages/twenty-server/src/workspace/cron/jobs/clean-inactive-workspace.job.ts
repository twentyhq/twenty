import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

@Injectable()
export class CleanInactiveWorkspaceJob implements MessageQueueJob<undefined> {
  async handle(): Promise<void> {
    console.log(`${CleanInactiveWorkspaceJob.name} called`);
  }
}
