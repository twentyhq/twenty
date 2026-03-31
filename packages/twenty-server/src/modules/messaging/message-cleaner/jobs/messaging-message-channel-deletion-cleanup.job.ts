import { Logger, Scope } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

export type MessagingMessageChannelDeletionCleanupJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingMessageChannelDeletionCleanupJob {
  private readonly logger = new Logger(
    MessagingMessageChannelDeletionCleanupJob.name,
  );

  constructor(
    private readonly messageCleanerService: MessagingMessageCleanerService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Process(MessagingMessageChannelDeletionCleanupJob.name)
  async handle(
    data: MessagingMessageChannelDeletionCleanupJobData,
  ): Promise<void> {
    const isMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      data.workspaceId,
    );

    if (!isMigrated) {
      return;
    }

    this.logger.debug(
      `WorkspaceId: ${data.workspaceId} Cleaning up message channel message associations for channel ${data.messageChannelId}`,
    );

    await this.messageCleanerService.deleteMessageChannelMessageAssociationsByChannelId(
      {
        workspaceId: data.workspaceId,
        messageChannelId: data.messageChannelId,
      },
    );

    await this.messageCleanerService.cleanOrphanMessagesAndThreads(
      data.workspaceId,
    );
  }
}
