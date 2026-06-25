import { timingSafeEqual } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import { type MicrosoftGraphNotification } from 'src/modules/connected-account-sync-webhooks/types/microsoft-graph-notification.type';
import { type WebhookNotificationHandler } from 'src/modules/connected-account-sync-webhooks/types/webhook-notification-handler.type';

@Injectable()
export class MicrosoftCalendarNotificationHandler implements WebhookNotificationHandler<
  MicrosoftGraphNotification[]
> {
  private readonly logger = new Logger(
    MicrosoftCalendarNotificationHandler.name,
  );

  constructor(
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly calendarWebhookSubscriptionService: CalendarWebhookSubscriptionService,
    private readonly webhookSyncTriggerService: WebhookSyncTriggerService,
  ) {}

  async handle(notifications: MicrosoftGraphNotification[]): Promise<void> {
    const subscriptionIds = notifications
      .map((notification) => notification.subscriptionId)
      .filter(isNonEmptyString);

    if (subscriptionIds.length === 0) {
      return;
    }

    const calendarChannels = await this.calendarChannelRepository.find({
      where: { webhookSubscriptionExternalId: In(subscriptionIds) },
    });

    const calendarChannelByExternalId = new Map(
      calendarChannels.map((calendarChannel) => [
        calendarChannel.webhookSubscriptionExternalId,
        calendarChannel,
      ]),
    );

    for (const notification of notifications) {
      const calendarChannel = calendarChannelByExternalId.get(
        notification.subscriptionId,
      );

      if (!isDefined(calendarChannel)) {
        this.logger.warn(
          `No calendar subscription found for ${notification.subscriptionId}`,
        );
        continue;
      }

      const clientState = notification.clientState;
      const expectedClientState =
        calendarChannel.webhookSubscriptionClientState;
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
        await this.calendarWebhookSubscriptionService.renewSubscription(
          calendarChannel,
        );
        continue;
      }

      await this.webhookSyncTriggerService.triggerCalendarSync(
        calendarChannel.id,
        calendarChannel.workspaceId,
      );
    }
  }
}
