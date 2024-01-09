import { Inject, Injectable } from '@nestjs/common';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  FetchAllMessagesFromConnectedAccountJob,
  FetchAllMessagesFromConnectedAccountJobData,
} from 'src/workspace/messaging/jobs/fetch-all-messages-from-connected-account.job';

@Injectable()
export class MessagingProducer {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueueFetchAllMessagesFromConnectedAccount(
    data: FetchAllMessagesFromConnectedAccountJobData,
    singletonKey: string,
  ) {
    await this.messageQueueService.add<FetchAllMessagesFromConnectedAccountJobData>(
      FetchAllMessagesFromConnectedAccountJob.name,
      data,
      {
        id: singletonKey,
        retryLimit: 2,
      },
    );
  }
}
