import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ConnectedAccountWebhookSubscriptionEntity,
  type WebhookSubscriptionChannelType,
} from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { type MicrosoftGraphNotification } from 'src/modules/connected-account-sync-webhooks/types/microsoft-graph-notification.type';
import { isSecretEqual } from 'src/modules/connected-account-sync-webhooks/utils/is-secret-equal.util';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import { WebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription.service';

@Injectable()
export class MicrosoftWebhookService {
  private readonly logger = new Logger(MicrosoftWebhookService.name);

  constructor(
    @InjectRepository(ConnectedAccountWebhookSubscriptionEntity)
    private readonly webhookSubscriptionRepository: Repository<ConnectedAccountWebhookSubscriptionEntity>,
    private readonly webhookSyncTriggerService: WebhookSyncTriggerService,
    private readonly webhookSubscriptionService: WebhookSubscriptionService,
  ) {}

  async handleEmailNotification(
    notifications: MicrosoftGraphNotification[],
  ): Promise<void> {
    await this.processNotifications(notifications, 'messaging');
  }

  async handleCalendarNotification(
    notifications: MicrosoftGraphNotification[],
  ): Promise<void> {
    await this.processNotifications(notifications, 'calendar');
  }

  private async processNotifications(
    notifications: MicrosoftGraphNotification[],
    channelType: WebhookSubscriptionChannelType,
  ): Promise<void> {
    this.logger.debug(
      `Received ${notifications.length} Microsoft ${channelType} notification(s)`,
    );

    for (const notification of notifications) {
      const subscription = await this.webhookSubscriptionRepository.findOne({
        where: {
          externalSubscriptionId: notification.subscriptionId,
          channelType,
        },
      });

      if (!isDefined(subscription)) {
        this.logger.warn(
          `no ${channelType} subscription for Microsoft subscriptionId ${notification.subscriptionId}`,
        );

        continue;
      }

      if (!isSecretEqual(notification.clientState, subscription.clientState)) {
        this.logger.warn(
          `clientState mismatch for Microsoft subscriptionId ${notification.subscriptionId} — ignored`,
        );

        continue;
      }

      if (isDefined(notification.lifecycleEvent)) {
        this.logger.debug(
          `Renewing Microsoft ${channelType} subscription ${notification.subscriptionId}`,
        );

        await this.webhookSubscriptionService.renewSubscription(subscription);

        continue;
      }

      if (
        channelType === 'messaging' &&
        isDefined(subscription.messageChannelId)
      ) {
        this.logger.debug(
          `Triggering messaging sync for channel ${subscription.messageChannelId}`,
        );

        await this.webhookSyncTriggerService.triggerMessagingSync(
          subscription.messageChannelId,
          subscription.workspaceId,
        );
      } else if (isDefined(subscription.calendarChannelId)) {
        this.logger.debug(
          `Triggering calendar sync for channel ${subscription.calendarChannelId}`,
        );

        await this.webhookSyncTriggerService.triggerCalendarSync(
          subscription.calendarChannelId,
          subscription.workspaceId,
        );
      }
    }
  }
}
