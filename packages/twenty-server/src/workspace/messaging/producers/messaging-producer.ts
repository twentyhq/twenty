import { Inject, Injectable } from '@nestjs/common';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  GmailFullSyncJob,
  GmailFullSyncJobData,
} from 'src/workspace/messaging/jobs/gmail-full-sync.job';

@Injectable()
export class MessagingProducer {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueueFetchAllMessagesFromConnectedAccount(
    data: GmailFullSyncJobData,
    singletonKey: string,
  ) {
    await this.messageQueueService.add<GmailFullSyncJobData>(
      GmailFullSyncJob.name,
      data,
      {
        id: singletonKey,
        retryLimit: 2,
      },
    );
  }
}
