import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessagingMessageListFetchJobData } from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { MessagingMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-message-list-fetch.service';

@Processor({
  queueName: MessageQueue.messagingOnboardingQueue,
  scope: Scope.REQUEST,
})
export class MessagingOnboardingMessageListFetchJob {
  constructor(
    private readonly messagingMessageListFetchService: MessagingMessageListFetchService,
  ) {}

  @Process(MessagingOnboardingMessageListFetchJob.name)
  async handle(data: MessagingMessageListFetchJobData): Promise<void> {
    await this.messagingMessageListFetchService.runForMessageChannel(data);
  }
}
