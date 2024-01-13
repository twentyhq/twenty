import { Inject, Injectable } from '@nestjs/common';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  GmailFullSyncJob,
  GmailFullSyncJobData,
} from 'src/workspace/messaging/jobs/gmail-full-sync.job';
import {
  GmailPartialSyncJob,
  GmailPartialSyncJobData,
} from 'src/workspace/messaging/jobs/gmail-partial-sync.job';

@Injectable()
export class MessagingProducer {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueueGmailFullSync(data: GmailFullSyncJobData, singletonKey: string) {
    await this.messageQueueService.add<GmailFullSyncJobData>(
      GmailFullSyncJob.name,
      data,
      {
        id: singletonKey,
        retryLimit: 2,
      },
    );
  }

  async enqueueGmailPartialSync(
    data: GmailPartialSyncJobData,
    singletonKey: string,
  ) {
    await this.messageQueueService.add<GmailPartialSyncJobData>(
      GmailPartialSyncJob.name,
      data,
      {
        id: singletonKey,
        retryLimit: 2,
      },
    );
  }
}
