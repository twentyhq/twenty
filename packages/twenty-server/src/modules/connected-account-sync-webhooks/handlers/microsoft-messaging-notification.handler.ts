import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { WebhookSubscriptionChannelType } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-channel-type.enum';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import { type MicrosoftGraphNotification } from 'src/modules/connected-account-sync-webhooks/types/microsoft-graph-notification.type';
import { type WebhookNotificationHandler } from 'src/modules/connected-account-sync-webhooks/types/webhook-notification-handler.type';
import { areStringsEqualConstantTime } from 'src/modules/connected-account-sync-webhooks/utils/are-strings-equal-constant-time.util';

@Injectable()
export class MicrosoftMessagingNotificationHandler implements WebhookNotificationHandler<
  MicrosoftGraphNotification[]
> {
  private readonly logger = new Logger(
    MicrosoftMessagingNotificationHandler.name,
  );

  constructor(
    @InjectRepository(ConnectedAccountWebhookSubscriptionEntity)
    private readonly webhookSubscriptionRepository: Repository<ConnectedAccountWebhookSubscriptionEntity>,
    private readonly messagingWebhookSubscriptionService: MessagingWebhookSubscriptionService,
    private readonly webhookSyncTriggerService: WebhookSyncTriggerService,
  ) {}

  async handle(notifications: MicrosoftGraphNotification[]): Promise<void> {
    for (const notification of notifications) {
      const subscription = await this.webhookSubscriptionRepository.findOne({
        where: {
          externalSubscriptionId: notification.subscriptionId,
          channelType: WebhookSubscriptionChannelType.MESSAGING,
        },
      });

      if (!isDefined(subscription)) {
        this.logger.warn(
          `No messaging subscription found for ${notification.subscriptionId}`,
        );
        continue;
      }

      if (
        !areStringsEqualConstantTime(
          notification.clientState,
          subscription.clientState,
        )
      ) {
        this.logger.warn(
          `Client state mismatch for subscription ${notification.subscriptionId}`,
        );
        continue;
      }

      if (isNonEmptyString(notification.lifecycleEvent)) {
        await this.messagingWebhookSubscriptionService.renewSubscription(
          subscription,
        );
        continue;
      }

      if (!isDefined(subscription.messageChannelId)) {
        continue;
      }

      await this.webhookSyncTriggerService.triggerMessagingSync(
        subscription.messageChannelId,
        subscription.workspaceId,
      );
    }
  }
}
