import { Inject, Injectable } from '@nestjs/common';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  FetchMessagesJob,
  FetchMessagesJobData,
} from 'src/workspace/messaging/jobs/fetch-messages.job';

@Injectable()
export class MessagingProducer {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueueFetchMessages(data: FetchMessagesJobData, singletonKey: string) {
    await this.messageQueueService.add<FetchMessagesJobData>(
      FetchMessagesJob.name,
      data,
      {
        id: singletonKey,
        retryLimit: 2,
      },
    );
  }
}
