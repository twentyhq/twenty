import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { ConnectedAccountSyncWebhookExceptionCode } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook-exception-code.enum';
import { ConnectedAccountSyncWebhookException } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook.exception';
import { type GoogleCalendarChannelNotification } from 'src/modules/connected-account-sync-webhooks/types/google-calendar-notification.type';
import {
  type GmailPushDecodedData,
  type GooglePubSubPushMessage,
} from 'src/modules/connected-account-sync-webhooks/types/google-pubsub-push.type';
import { isSecretEqual } from 'src/modules/connected-account-sync-webhooks/utils/is-secret-equal.util';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';

@Injectable()
export class GoogleWebhookService {
  private readonly logger = new Logger(GoogleWebhookService.name);

  constructor(
    @InjectRepository(ConnectedAccountWebhookSubscriptionEntity)
    private readonly webhookSubscriptionRepository: Repository<ConnectedAccountWebhookSubscriptionEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly webhookSyncTriggerService: WebhookSyncTriggerService,
  ) {}

  async handleEmailNotification(
    notification: GooglePubSubPushMessage,
  ): Promise<void> {
    const decodedData = this.decodeGmailPushData(notification.message?.data);

    if (
      !isDefined(decodedData) ||
      !isNonEmptyString(decodedData.emailAddress)
    ) {
      this.logger.warn('Received Gmail push with no decodable emailAddress');

      return;
    }

    this.logger.debug(
      `Received Gmail push for ${decodedData.emailAddress} (historyId ${decodedData.historyId})`,
    );

    const connectedAccounts = await this.connectedAccountRepository.find({
      where: {
        handle: decodedData.emailAddress,
        provider: ConnectedAccountProvider.GOOGLE,
      },
    });

    if (connectedAccounts.length === 0) {
      this.logger.warn(
        `No connected Google account for ${decodedData.emailAddress}`,
      );

      return;
    }

    const subscriptions = await this.webhookSubscriptionRepository.find({
      where: {
        connectedAccountId: In(
          connectedAccounts.map((connectedAccount) => connectedAccount.id),
        ),
        channelType: 'messaging',
        status: 'ACTIVE',
      },
    });

    for (const subscription of subscriptions) {
      if (!isDefined(subscription.messageChannelId)) {
        continue;
      }

      this.logger.debug(
        `Triggering messaging sync for channel ${subscription.messageChannelId}`,
      );

      await this.webhookSyncTriggerService.triggerMessagingSync(
        subscription.messageChannelId,
        subscription.workspaceId,
      );
    }
  }

  async handleCalendarNotification(
    notification: GoogleCalendarChannelNotification,
  ): Promise<void> {
    this.logger.debug(
      `Received Google Calendar push (channel ${notification.channelId}, state ${notification.resourceState})`,
    );

    if (notification.resourceState === 'sync') {
      return;
    }

    if (!isNonEmptyString(notification.channelId)) {
      return;
    }

    const subscription = await this.webhookSubscriptionRepository.findOne({
      where: {
        externalSubscriptionId: notification.channelId,
        channelType: 'calendar',
      },
    });

    if (!isDefined(subscription)) {
      return;
    }

    if (!isSecretEqual(subscription.clientState, notification.channelToken)) {
      throw new ConnectedAccountSyncWebhookException(
        'Google Calendar notification token mismatch',
        ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_INVALID_SIGNATURE,
      );
    }

    if (!isDefined(subscription.calendarChannelId)) {
      return;
    }

    this.logger.debug(
      `Triggering calendar sync for channel ${subscription.calendarChannelId}`,
    );

    await this.webhookSyncTriggerService.triggerCalendarSync(
      subscription.calendarChannelId,
      subscription.workspaceId,
    );
  }

  private decodeGmailPushData(
    encodedData: string | undefined,
  ): GmailPushDecodedData | undefined {
    if (!isNonEmptyString(encodedData)) {
      return undefined;
    }

    try {
      return JSON.parse(
        Buffer.from(encodedData, 'base64').toString('utf8'),
      ) as GmailPushDecodedData;
    } catch {
      return undefined;
    }
  }
}
