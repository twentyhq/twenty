import { timingSafeEqual } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import { type MicrosoftGraphNotification } from 'src/modules/connected-account-sync-webhooks/types/microsoft-graph-notification.type';
import { type WebhookNotificationHandler } from 'src/modules/connected-account-sync-webhooks/types/webhook-notification-handler.type';

@Injectable()
export class MicrosoftMessagingNotificationHandler implements WebhookNotificationHandler<
  MicrosoftGraphNotification[]
> {
  private readonly logger = new Logger(
    MicrosoftMessagingNotificationHandler.name,
  );

  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly messagingWebhookSubscriptionService: MessagingWebhookSubscriptionService,
    private readonly webhookSyncTriggerService: WebhookSyncTriggerService,
  ) {}

  async handle(notifications: MicrosoftGraphNotification[]): Promise<void> {
    const subscriptionIds = notifications
      .map((notification) => notification.subscriptionId)
      .filter(isNonEmptyString);

    if (subscriptionIds.length === 0) {
      return;
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: { webhookSubscriptionExternalId: In(subscriptionIds) },
    });

    const messageChannelByExternalId = new Map(
      messageChannels.map((messageChannel) => [
        messageChannel.webhookSubscriptionExternalId,
        messageChannel,
      ]),
    );

    for (const notification of notifications) {
      const messageChannel = messageChannelByExternalId.get(
        notification.subscriptionId,
      );

      if (!isDefined(messageChannel)) {
        this.logger.warn(
          `No messaging subscription found for ${notification.subscriptionId}`,
        );
        continue;
      }

      const clientState = notification.clientState;
      const expectedClientState = messageChannel.webhookSubscriptionClientState;
      const clientStateBuffer = isNonEmptyString(clientState)
        ? Buffer.from(clientState)
        : null;
      const expectedClientStateBuffer = isNonEmptyString(expectedClientState)
        ? Buffer.from(expectedClientState)
        : null;

      if (
        !isDefined(clientStateBuffer) ||
        !isDefined(expectedClientStateBuffer) ||
        clientStateBuffer.length !== expectedClientStateBuffer.length ||
        !timingSafeEqual(clientStateBuffer, expectedClientStateBuffer)
      ) {
        this.logger.warn(
          `Client state mismatch for subscription ${notification.subscriptionId}`,
        );
        continue;
      }

      if (
        isNonEmptyString(notification.lifecycleEvent) &&
        notification.lifecycleEvent !== 'missed'
      ) {
        await this.messagingWebhookSubscriptionService.renewSubscription(
          messageChannel,
        );
        continue;
      }

      await this.webhookSyncTriggerService.triggerMessagingSync(
        messageChannel.id,
        messageChannel.workspaceId,
      );
    }
  }
}
