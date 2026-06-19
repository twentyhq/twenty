import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type calendar_v3, google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import {
  GOOGLE_CALENDAR_WATCH_TTL_MS,
  WEBHOOK_SUBSCRIPTION_ROUTE_PATHS,
} from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription.constants';
import { WebhookSubscriptionDriverExceptionCode } from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver-exception-code.enum';
import { WebhookSubscriptionDriverException } from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import {
  type WebhookSubscriptionDriver,
  type WebhookSubscriptionDriverInput,
  type WebhookSubscriptionResult,
} from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-driver.type';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';

@Injectable()
export class GoogleWebhookSubscriptionDriver implements WebhookSubscriptionDriver {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async createSubscription(
    input: WebhookSubscriptionDriverInput,
  ): Promise<WebhookSubscriptionResult> {
    return input.channelType === 'messaging'
      ? this.watchGmailMailbox(input)
      : this.watchPrimaryCalendar(input);
  }

  async renewSubscription(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
    input: WebhookSubscriptionDriverInput,
  ): Promise<WebhookSubscriptionResult> {
    if (input.channelType === 'calendar') {
      await this.deleteSubscription(subscription, input);
    }

    return this.createSubscription(input);
  }

  async deleteSubscription(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
    input: WebhookSubscriptionDriverInput,
  ): Promise<void> {
    return input.channelType === 'messaging'
      ? this.stopGmailMailboxWatch(input)
      : this.stopCalendarWatch(subscription, input);
  }

  private async watchGmailMailbox(
    input: WebhookSubscriptionDriverInput,
  ): Promise<WebhookSubscriptionResult> {
    const pubSubTopicName = this.twentyConfigService.get(
      'MESSAGING_GMAIL_PUBSUB_TOPIC',
    );

    if (!isNonEmptyString(pubSubTopicName)) {
      throw new WebhookSubscriptionDriverException(
        'MESSAGING_GMAIL_PUBSUB_TOPIC is not configured',
        WebhookSubscriptionDriverExceptionCode.PROVIDER_NOT_CONFIGURED,
      );
    }

    const gmailClient = await this.getGmailClient(input.connectedAccountId);

    const { data } = await gmailClient.users.watch({
      userId: 'me',
      requestBody: {
        topicName: pubSubTopicName,
      },
    });

    if (!isDefined(data.expiration)) {
      throw new WebhookSubscriptionDriverException(
        'Gmail watch response did not include an expiration',
        WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID,
      );
    }

    return {
      externalSubscriptionId: null,
      externalResourceId: null,
      expiresAt: new Date(Number(data.expiration)),
    };
  }

  private async stopGmailMailboxWatch(
    input: WebhookSubscriptionDriverInput,
  ): Promise<void> {
    const gmailClient = await this.getGmailClient(input.connectedAccountId);

    await gmailClient.users.stop({ userId: 'me' });
  }

  private async watchPrimaryCalendar(
    input: WebhookSubscriptionDriverInput,
  ): Promise<WebhookSubscriptionResult> {
    const calendarClient = await this.getCalendarClient(
      input.connectedAccountId,
    );

    const notificationAddress = `${this.twentyConfigService.get('SERVER_URL')}/${WEBHOOK_SUBSCRIPTION_ROUTE_PATHS.GOOGLE_CALENDAR}`;
    const watchChannelId = v4();

    const { data } = await calendarClient.events.watch({
      calendarId: 'primary',
      requestBody: {
        id: watchChannelId,
        type: 'web_hook',
        address: notificationAddress,
        token: input.clientState,
        params: { ttl: String(GOOGLE_CALENDAR_WATCH_TTL_MS / 1000) },
      },
    });

    if (!isDefined(data.resourceId) || !isDefined(data.expiration)) {
      throw new WebhookSubscriptionDriverException(
        'Google Calendar watch response did not include a resourceId or expiration',
        WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID,
      );
    }

    return {
      externalSubscriptionId: watchChannelId,
      externalResourceId: data.resourceId,
      expiresAt: new Date(Number(data.expiration)),
    };
  }

  private async stopCalendarWatch(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
    input: WebhookSubscriptionDriverInput,
  ): Promise<void> {
    if (
      !isDefined(subscription.externalSubscriptionId) ||
      !isDefined(subscription.externalResourceId)
    ) {
      return;
    }

    const calendarClient = await this.getCalendarClient(
      input.connectedAccountId,
    );

    await calendarClient.channels.stop({
      requestBody: {
        id: subscription.externalSubscriptionId,
        resourceId: subscription.externalResourceId,
      },
    });
  }

  private async getGmailClient(connectedAccountId: string) {
    const oAuth2Client =
      await this.googleOAuth2ClientProvider.getClient(connectedAccountId);

    return google.gmail({ version: 'v1', auth: oAuth2Client });
  }

  private async getCalendarClient(
    connectedAccountId: string,
  ): Promise<calendar_v3.Calendar> {
    const oAuth2Client =
      await this.googleOAuth2ClientProvider.getClient(connectedAccountId);

    return google.calendar({ version: 'v3', auth: oAuth2Client });
  }
}
