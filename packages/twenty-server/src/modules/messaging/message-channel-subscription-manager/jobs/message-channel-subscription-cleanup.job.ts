import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelSubscriptionProvider,
  MessageChannelSubscriptionWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel-subscription.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { GmailSubscriptionDriverService } from 'src/modules/messaging/message-channel-subscription-manager/drivers/gmail/gmail-subscription-driver.service';
import { MessageChannelSubscriptionService } from 'src/modules/messaging/message-channel-subscription-manager/services/message-channel-subscription.service';

export type MessageChannelSubscriptionCleanupJobData = {
  workspaceId: string;
  messageChannelId: string;
  connectedAccountId?: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessageChannelSubscriptionCleanupJob {
  private readonly logger = new Logger(
    MessageChannelSubscriptionCleanupJob.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly subscriptionService: MessageChannelSubscriptionService,
    private readonly gmailSubscriptionDriver: GmailSubscriptionDriverService,
  ) {}

  @Process(MessageChannelSubscriptionCleanupJob.name)
  async handle(data: MessageChannelSubscriptionCleanupJobData): Promise<void> {
    const { workspaceId, messageChannelId, connectedAccountId } = data;

    this.logger.log(
      `Cleaning up subscription for message channel ${messageChannelId} (workspace: ${workspaceId})`,
    );

    const subscription =
      await this.subscriptionService.findByMessageChannelId(
        messageChannelId,
        workspaceId,
      );

    if (!subscription) {
      this.logger.log(
        `No subscription found for message channel ${messageChannelId}, nothing to clean up`,
      );

      return;
    }

    let connectedAccount: ConnectedAccountWorkspaceEntity | null = null;

    if (connectedAccountId) {
      const connectedAccountRepository =
        await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
          workspaceId,
          'connectedAccount',
        );

      connectedAccount = await connectedAccountRepository.findOne({
        where: { id: connectedAccountId },
      });
    } else {
      const messageChannelRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
          workspaceId,
          'messageChannel',
        );

      const messageChannel = await messageChannelRepository.findOne({
        where: { id: messageChannelId },
        relations: ['connectedAccount'],
      });

      connectedAccount =
        (messageChannel?.connectedAccount as ConnectedAccountWorkspaceEntity) ??
        null;
    }

    if (connectedAccount) {
      await this.stopWithDriver(
        subscription,
        connectedAccount,
        workspaceId,
      );
    } else {
      this.logger.warn(
        `Could not find connected account for message channel ${messageChannelId}, skipping provider cleanup`,
      );
    }

    await this.subscriptionService.delete(messageChannelId, workspaceId);

    this.logger.log(
      `Successfully cleaned up subscription for message channel ${messageChannelId}`,
    );
  }

  private async stopWithDriver(
    subscription: MessageChannelSubscriptionWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    try {
      switch (subscription.provider) {
        case MessageChannelSubscriptionProvider.GMAIL_PUBSUB:
          await this.gmailSubscriptionDriver.stopSubscription(
            connectedAccount,
            workspaceId,
          );
          break;
        default:
          this.logger.warn(
            `Unknown subscription provider: ${subscription.provider}`,
          );
      }
    } catch (error) {
      this.logger.error(
        `Failed to stop provider subscription: ${error.message}`,
      );
    }
  }
}
