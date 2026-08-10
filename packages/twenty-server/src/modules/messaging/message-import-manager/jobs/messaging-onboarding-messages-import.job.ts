import { Scope } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { type MessagingMessagesImportJobData } from 'src/modules/messaging/message-import-manager/jobs/messaging-messages-import.job';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';

@Processor({
  queueName: MessageQueue.messagingOnboardingQueue,
  scope: Scope.REQUEST,
})
export class MessagingOnboardingMessagesImportJob {
  constructor(
    private readonly messagingMessagesImportService: MessagingMessagesImportService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    @InjectMessageQueue(MessageQueue.messagingOnboardingQueue)
    private readonly onboardingQueueService: MessageQueueService,
  ) {}

  @Process(MessagingOnboardingMessagesImportJob.name)
  async handle(data: MessagingMessagesImportJobData): Promise<void> {
    const { messageChannelId, workspaceId } = data;

    const { hasMoreMessagesToImport } =
      await this.messagingMessagesImportService.runForMessageChannel(data);

    if (!hasMoreMessagesToImport) {
      return;
    }

    // Chain the next batch straight away instead of waiting up to a minute for
    // the import cron, so the first sync of a new account finishes fast
    const claimedMessageChannelIds =
      await this.messageChannelSyncStatusService.claimPendingMessagesImport(
        [messageChannelId],
        workspaceId,
      );

    if (claimedMessageChannelIds.length === 0) {
      return;
    }

    await this.onboardingQueueService.add<MessagingMessagesImportJobData>(
      MessagingOnboardingMessagesImportJob.name,
      { workspaceId, messageChannelId },
    );
  }
}
