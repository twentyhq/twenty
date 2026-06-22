import { Injectable } from '@nestjs/common';

import { type Subscription } from '@microsoft/microsoft-graph-types';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { WebhookSubscriptionChannelType } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-channel-type.enum';
import { MICROSOFT_SUBSCRIPTION_TTL_MINUTES } from 'src/modules/connected-account/webhook-subscription-manager/constants/microsoft-subscription-ttl-minutes.constant';
import { WEBHOOK_SUBSCRIPTION_ROUTE_PATHS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-route-paths.constant';
import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import {
  type WebhookSubscriptionDriver,
  type WebhookSubscriptionResult,
} from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-driver.type';
import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';

type MicrosoftGraphResourceConfig = {
  resource: string;
  changeType: string;
  notificationPath: string;
};

const MICROSOFT_GRAPH_RESOURCE_CONFIG_BY_CHANNEL_TYPE: Record<
  WebhookSubscriptionChannelType,
  MicrosoftGraphResourceConfig
> = {
  [WebhookSubscriptionChannelType.MESSAGING]: {
    resource: '/me/messages',
    changeType: 'created,updated',
    notificationPath: WEBHOOK_SUBSCRIPTION_ROUTE_PATHS.MICROSOFT_MESSAGING,
  },
  [WebhookSubscriptionChannelType.CALENDAR]: {
    resource: '/me/events',
    changeType: 'created,updated,deleted',
    notificationPath: WEBHOOK_SUBSCRIPTION_ROUTE_PATHS.MICROSOFT_CALENDAR,
  },
};

@Injectable()
export class MicrosoftWebhookSubscriptionDriver implements WebhookSubscriptionDriver {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async createSubscription(
    connectedAccountId: string,
    channelType: WebhookSubscriptionChannelType,
    clientState: string,
  ): Promise<WebhookSubscriptionResult> {
    const resourceConfig =
      MICROSOFT_GRAPH_RESOURCE_CONFIG_BY_CHANNEL_TYPE[channelType];
    const graphClient =
      await this.microsoftOAuth2ClientProvider.getClient(connectedAccountId);

    const notificationUrl = `${this.twentyConfigService.get('SERVER_URL')}/${resourceConfig.notificationPath}`;

    const subscription: Subscription = await graphClient
      .api('/subscriptions')
      .post({
        changeType: resourceConfig.changeType,
        notificationUrl,
        lifecycleNotificationUrl: notificationUrl,
        resource: resourceConfig.resource,
        expirationDateTime: new Date(
          Date.now() + MICROSOFT_SUBSCRIPTION_TTL_MINUTES * 60 * 1000,
        ).toISOString(),
        clientState,
      });

    return this.toResult(subscription);
  }

  async renewSubscription(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
  ): Promise<WebhookSubscriptionResult> {
    const graphClient = await this.microsoftOAuth2ClientProvider.getClient(
      subscription.connectedAccountId,
    );

    const renewedSubscription: Subscription = await graphClient
      .api(`/subscriptions/${subscription.externalSubscriptionId}`)
      .patch({
        expirationDateTime: new Date(
          Date.now() + MICROSOFT_SUBSCRIPTION_TTL_MINUTES * 60 * 1000,
        ).toISOString(),
      });

    return this.toResult(renewedSubscription);
  }

  async deleteSubscription(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
  ): Promise<void> {
    if (!isDefined(subscription.externalSubscriptionId)) {
      return;
    }

    const graphClient = await this.microsoftOAuth2ClientProvider.getClient(
      subscription.connectedAccountId,
    );

    await graphClient
      .api(`/subscriptions/${subscription.externalSubscriptionId}`)
      .delete();
  }

  private toResult(subscription: Subscription): WebhookSubscriptionResult {
    if (
      !isDefined(subscription.id) ||
      !isDefined(subscription.expirationDateTime)
    ) {
      throw new WebhookSubscriptionDriverException(
        'Microsoft Graph subscription response did not include an id or expiration',
        WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID,
      );
    }

    return {
      externalSubscriptionId: subscription.id,
      externalResourceId: null,
      expiresAt: new Date(subscription.expirationDateTime),
    };
  }
}
