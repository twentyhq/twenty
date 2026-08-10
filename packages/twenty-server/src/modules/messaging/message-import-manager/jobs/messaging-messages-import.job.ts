import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';

export type MessagingMessagesImportJobData = {
  messageChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingMessagesImportJob {
  constructor(
    private readonly messagingMessagesImportService: MessagingMessagesImportService,
  ) {}

  @Process(MessagingMessagesImportJob.name)
  async handle(data: MessagingMessagesImportJobData): Promise<void> {
    await this.messagingMessagesImportService.runForMessageChannel(data);
  }
}
