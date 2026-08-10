import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessagingOnboardingFirstBatchImportService } from 'src/modules/messaging/message-import-manager/services/messaging-onboarding-first-batch-import.service';

export type MessagingOnboardingFirstBatchImportJobData = {
  messageChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingOnboardingQueue,
  scope: Scope.REQUEST,
})
export class MessagingOnboardingFirstBatchImportJob {
  constructor(
    private readonly messagingOnboardingFirstBatchImportService: MessagingOnboardingFirstBatchImportService,
  ) {}

  @Process(MessagingOnboardingFirstBatchImportJob.name)
  async handle(
    data: MessagingOnboardingFirstBatchImportJobData,
  ): Promise<void> {
    await this.messagingOnboardingFirstBatchImportService.importFirstBatch(
      data,
    );
  }
}
