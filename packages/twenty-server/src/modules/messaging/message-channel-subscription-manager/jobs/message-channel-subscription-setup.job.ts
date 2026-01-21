import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelSubscriptionProvider,
  MessageChannelSubscriptionStatus,
} from 'src/modules/messaging/common/standard-objects/message-channel-subscription.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { GmailSubscriptionDriverService } from 'src/modules/messaging/message-channel-subscription-manager/drivers/gmail/gmail-subscription-driver.service';
import { MessageChannelSubscriptionService } from 'src/modules/messaging/message-channel-subscription-manager/services/message-channel-subscription.service';

export type MessageChannelSubscriptionSetupJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessageChannelSubscriptionSetupJob {
  private readonly logger = new Logger(MessageChannelSubscriptionSetupJob.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly subscriptionService: MessageChannelSubscriptionService,
    private readonly gmailSubscriptionDriver: GmailSubscriptionDriverService,
  ) {}

  @Process(MessageChannelSubscriptionSetupJob.name)
  async handle(data: MessageChannelSubscriptionSetupJobData): Promise<void> {
    const { workspaceId, messageChannelId } = data;

    this.logger.log(
      `Setting up subscription for message channel ${messageChannelId} (workspace: ${workspaceId})`,
    );

    const existingSubscription =
      await this.subscriptionService.findByMessageChannelId(
        messageChannelId,
        workspaceId,
      );

    if (existingSubscription) {
      this.logger.log(
        `Subscription already exists for message channel ${messageChannelId}, skipping setup`,
      );

      return;
    }

    const messageChannelRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: { id: messageChannelId },
      relations: ['connectedAccount'],
    });

    if (!messageChannel) {
      this.logger.error(
        `Message channel ${messageChannelId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const connectedAccount =
      messageChannel.connectedAccount as ConnectedAccountWorkspaceEntity;

    if (!connectedAccount) {
      this.logger.error(
        `No connected account for message channel ${messageChannelId}`,
      );

      return;
    }

    const provider = this.getProviderFromConnectedAccount(connectedAccount);

    if (!provider) {
      this.logger.log(
        `Provider ${connectedAccount.provider} does not support push notifications`,
      );

      return;
    }

    const subscription = await this.subscriptionService.create(
      {
        messageChannelId,
        provider,
        status: MessageChannelSubscriptionStatus.PENDING,
      },
      workspaceId,
    );

    try {
      const result = await this.setupWithDriver(
        provider,
        connectedAccount,
        messageChannel,
        workspaceId,
      );

      await this.subscriptionService.updateStatus(
        subscription.id,
        MessageChannelSubscriptionStatus.ACTIVE,
        workspaceId,
        {
          expiresAt: result.expiresAt,
          providerSubscriptionId: result.providerSubscriptionId,
        },
      );

      this.logger.log(
        `Successfully set up ${provider} subscription for message channel ${messageChannelId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to set up subscription for message channel ${messageChannelId}: ${error.message}`,
      );

      await this.subscriptionService.updateStatus(
        subscription.id,
        MessageChannelSubscriptionStatus.FAILED,
        workspaceId,
        {
          lastError: error.message,
          failureCount: 1,
        },
      );
    }
  }

  private getProviderFromConnectedAccount(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): MessageChannelSubscriptionProvider | null {
    switch (connectedAccount.provider) {
      case 'google':
        return MessageChannelSubscriptionProvider.GMAIL_PUBSUB;
      default:
        return null;
    }
  }

  private async setupWithDriver(
    provider: MessageChannelSubscriptionProvider,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ) {
    switch (provider) {
      case MessageChannelSubscriptionProvider.GMAIL_PUBSUB:
        return this.gmailSubscriptionDriver.setupSubscription(
          connectedAccount,
          messageChannel,
          workspaceId,
        );
      default:
        throw new Error(`Unsupported subscription provider: ${provider}`);
    }
  }
}
