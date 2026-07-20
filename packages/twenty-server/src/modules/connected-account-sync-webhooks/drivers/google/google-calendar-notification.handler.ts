import { timingSafeEqual } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { WebhookSubscriptionStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import {
  ConnectedAccountSyncWebhookException,
  ConnectedAccountSyncWebhookExceptionCode,
} from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook.exception';
import { type GoogleCalendarChannelNotification } from 'src/modules/connected-account-sync-webhooks/types/google-calendar-notification.type';
import { type WebhookNotificationHandler } from 'src/modules/connected-account-sync-webhooks/types/webhook-notification-handler.type';

const GOOGLE_CALENDAR_SYNC_RESOURCE_STATE = 'sync';

@Injectable()
export class GoogleCalendarNotificationHandler implements WebhookNotificationHandler<GoogleCalendarChannelNotification> {
  private readonly logger = new Logger(GoogleCalendarNotificationHandler.name);

  constructor(
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly webhookSyncTriggerService: WebhookSyncTriggerService,
    private readonly metricsService: MetricsService,
  ) {}

  async handle(request: GoogleCalendarChannelNotification): Promise<void> {
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.ConnectedAccountSyncWebhookReceivedCalendar,
      amount: 1,
    });

    if (request.resourceState === GOOGLE_CALENDAR_SYNC_RESOURCE_STATE) {
      return;
    }

    if (!isNonEmptyString(request.channelId)) {
      return;
    }

    const calendarChannel = await this.calendarChannelRepository.findOne({
      where: {
        webhookSubscriptionExternalId: request.channelId,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
      },
    });

    if (!isDefined(calendarChannel)) {
      this.logger.warn(
        `No calendar channel found for Google channel ${request.channelId}`,
      );

      return;
    }

    const channelToken = request.channelToken;
    const clientState = calendarChannel.webhookSubscriptionClientState;
    const channelTokenBuffer = isNonEmptyString(channelToken)
      ? Buffer.from(channelToken)
      : null;
    const clientStateBuffer = isNonEmptyString(clientState)
      ? Buffer.from(clientState)
      : null;

    if (
      !isDefined(channelTokenBuffer) ||
      !isDefined(clientStateBuffer) ||
      channelTokenBuffer.length !== clientStateBuffer.length ||
      !timingSafeEqual(channelTokenBuffer, clientStateBuffer)
    ) {
      throw new ConnectedAccountSyncWebhookException(
        'Google calendar channel token mismatch',
        ConnectedAccountSyncWebhookExceptionCode.INVALID_SIGNATURE,
      );
    }

    await this.webhookSyncTriggerService.triggerCalendarSync(
      calendarChannel.id,
      calendarChannel.workspaceId,
    );

    this.logger.log(
      `Triggered calendar sync for calendar channel ${calendarChannel.id} from Google notification`,
    );
  }
}
