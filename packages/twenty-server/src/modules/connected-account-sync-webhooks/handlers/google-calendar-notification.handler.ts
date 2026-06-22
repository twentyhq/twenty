import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { WebhookSubscriptionChannelType } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-channel-type.enum';
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
    @InjectRepository(ConnectedAccountWebhookSubscriptionEntity)
    private readonly webhookSubscriptionRepository: Repository<ConnectedAccountWebhookSubscriptionEntity>,
    private readonly webhookSyncTriggerService: WebhookSyncTriggerService,
  ) {}

  async handle(request: GoogleCalendarChannelNotification): Promise<void> {
    if (request.resourceState === GOOGLE_CALENDAR_SYNC_RESOURCE_STATE) {
      return;
    }

    if (!isNonEmptyString(request.channelId)) {
      return;
    }

    const subscription = await this.webhookSubscriptionRepository.findOne({
      where: {
        externalSubscriptionId: request.channelId,
        channelType: WebhookSubscriptionChannelType.CALENDAR,
      },
    });

    if (!isDefined(subscription)) {
      return;
    }

    if (
      !areStringsEqualConstantTime(
        request.channelToken,
        subscription.clientState,
      )
    ) {
      throw new ConnectedAccountSyncWebhookException(
        'Google calendar channel token mismatch',
        ConnectedAccountSyncWebhookExceptionCode.INVALID_SIGNATURE,
      );
    }

    if (!isDefined(subscription.calendarChannelId)) {
      return;
    }

    await this.webhookSyncTriggerService.triggerCalendarSync(
      subscription.calendarChannelId,
      subscription.workspaceId,
    );
  }
}
