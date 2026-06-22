import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { WebhookSubscriptionStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import {
  ConnectedAccountSyncWebhookException,
  ConnectedAccountSyncWebhookExceptionCode,
} from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook.exception';
import { type GoogleCalendarChannelNotification } from 'src/modules/connected-account-sync-webhooks/types/google-calendar-notification.type';
import { type WebhookNotificationHandler } from 'src/modules/connected-account-sync-webhooks/types/webhook-notification-handler.type';
import { areStringsEqualConstantTime } from 'src/modules/connected-account-sync-webhooks/utils/are-strings-equal-constant-time.util';

const GOOGLE_CALENDAR_SYNC_RESOURCE_STATE = 'sync';

@Injectable()
export class GoogleCalendarNotificationHandler implements WebhookNotificationHandler<GoogleCalendarChannelNotification> {
  constructor(
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly webhookSyncTriggerService: WebhookSyncTriggerService,
  ) {}

  async handle(request: GoogleCalendarChannelNotification): Promise<void> {
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
      return;
    }

    if (
      !areStringsEqualConstantTime(
        request.channelToken,
        calendarChannel.webhookSubscriptionClientState,
      )
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
  }
}
