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

export type MessageChannelSubscriptionRenewalJobData = {
  workspaceId: string;
  subscriptionId: string;
};

const MAX_RENEWAL_FAILURES = 3;

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessageChannelSubscriptionRenewalJob {
  private readonly logger = new Logger(
    MessageChannelSubscriptionRenewalJob.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly subscriptionService: MessageChannelSubscriptionService,
    private readonly gmailSubscriptionDriver: GmailSubscriptionDriverService,
  ) {}

  @Process(MessageChannelSubscriptionRenewalJob.name)
  async handle(data: MessageChannelSubscriptionRenewalJobData): Promise<void> {
    const { workspaceId, subscriptionId } = data;

    this.logger.log(
      `Renewing subscription ${subscriptionId} (workspace: ${workspaceId})`,
    );

    const subscription = await this.subscriptionService.findByMessageChannelId(
      subscriptionId,
      workspaceId,
    );

    if (!subscription) {
      const messageChannelSubscriptionRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          'messageChannelSubscription',
        );

      const subscriptionById =
        await messageChannelSubscriptionRepository.findOne({
          where: { id: subscriptionId },
        });

      if (!subscriptionById) {
        this.logger.error(
          `Subscription ${subscriptionId} not found in workspace ${workspaceId}`,
        );

        return;
      }
    }

    const subscriptionToRenew = subscription;

    if (!subscriptionToRenew) {
      return;
    }

    const messageChannelRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: { id: subscriptionToRenew.messageChannelId },
      relations: ['connectedAccount'],
    });

    if (!messageChannel) {
      this.logger.error(
        `Message channel ${subscriptionToRenew.messageChannelId} not found`,
      );

      await this.subscriptionService.updateStatus(
        subscriptionToRenew.id,
        MessageChannelSubscriptionStatus.FAILED,
        workspaceId,
        {
          lastError: 'Message channel not found',
        },
      );

      return;
    }

    const connectedAccount =
      messageChannel.connectedAccount as ConnectedAccountWorkspaceEntity;

    if (!connectedAccount) {
      this.logger.error(
        `No connected account for message channel ${messageChannel.id}`,
      );

      await this.subscriptionService.updateStatus(
        subscriptionToRenew.id,
        MessageChannelSubscriptionStatus.FAILED,
        workspaceId,
        {
          lastError: 'Connected account not found',
        },
      );

      return;
    }

    try {
      const result = await this.renewWithDriver(
        subscriptionToRenew.provider as MessageChannelSubscriptionProvider,
        connectedAccount,
        messageChannel,
        workspaceId,
      );

      await this.subscriptionService.updateStatus(
        subscriptionToRenew.id,
        MessageChannelSubscriptionStatus.ACTIVE,
        workspaceId,
        {
          expiresAt: result.expiresAt,
          providerSubscriptionId: result.providerSubscriptionId,
          lastError: null,
          failureCount: 0,
        },
      );

      this.logger.log(
        `Successfully renewed subscription ${subscriptionToRenew.id}, new expiration: ${result.expiresAt.toISOString()}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to renew subscription ${subscriptionToRenew.id}: ${error.message}`,
      );

      const newFailureCount = subscriptionToRenew.failureCount + 1;
      const newStatus =
        newFailureCount >= MAX_RENEWAL_FAILURES
          ? MessageChannelSubscriptionStatus.FAILED
          : MessageChannelSubscriptionStatus.EXPIRED;

      await this.subscriptionService.updateStatus(
        subscriptionToRenew.id,
        newStatus,
        workspaceId,
        {
          lastError: error.message,
          failureCount: newFailureCount,
        },
      );

      if (newFailureCount >= MAX_RENEWAL_FAILURES) {
        this.logger.error(
          `Subscription ${subscriptionToRenew.id} exceeded max renewal failures, marked as FAILED`,
        );
      }
    }
  }

  private async renewWithDriver(
    provider: MessageChannelSubscriptionProvider,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ) {
    switch (provider) {
      case MessageChannelSubscriptionProvider.GMAIL_PUBSUB:
        return this.gmailSubscriptionDriver.renewSubscription(
          connectedAccount,
          messageChannel,
          workspaceId,
        );
      default:
        throw new Error(`Unsupported subscription provider: ${provider}`);
    }
  }
}
