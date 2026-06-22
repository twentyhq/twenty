import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { OAuth2Client } from 'google-auth-library';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { WebhookSubscriptionChannelType } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-channel-type.enum';
import { WebhookSubscriptionStatus } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-status.enum';
import { WEBHOOK_SUBSCRIPTION_ROUTE_PATHS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-route-paths.constant';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import {
  ConnectedAccountSyncWebhookException,
  ConnectedAccountSyncWebhookExceptionCode,
} from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook.exception';
import {
  type GmailPushDecodedData,
  type GooglePubSubPushMessage,
} from 'src/modules/connected-account-sync-webhooks/types/google-pubsub-push.type';
import { type WebhookNotificationHandler } from 'src/modules/connected-account-sync-webhooks/types/webhook-notification-handler.type';

export type GoogleMessagingNotificationRequest = {
  body: GooglePubSubPushMessage;
  authorizationHeader: string | undefined;
};

@Injectable()
export class GoogleMessagingNotificationHandler implements WebhookNotificationHandler<GoogleMessagingNotificationRequest> {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(ConnectedAccountWebhookSubscriptionEntity)
    private readonly webhookSubscriptionRepository: Repository<ConnectedAccountWebhookSubscriptionEntity>,
    private readonly webhookSyncTriggerService: WebhookSyncTriggerService,
  ) {}

  async handle(request: GoogleMessagingNotificationRequest): Promise<void> {
    await this.verify(request.authorizationHeader);

    const decodedData = this.decodeMessageData(request.body);

    if (!isDefined(decodedData)) {
      return;
    }

    const connectedAccounts = await this.connectedAccountRepository.find({
      where: {
        handle: decodedData.emailAddress,
        provider: ConnectedAccountProvider.GOOGLE,
      },
    });

    for (const connectedAccount of connectedAccounts) {
      const subscriptions = await this.webhookSubscriptionRepository.find({
        where: {
          connectedAccountId: connectedAccount.id,
          workspaceId: connectedAccount.workspaceId,
          channelType: WebhookSubscriptionChannelType.MESSAGING,
          status: WebhookSubscriptionStatus.ACTIVE,
        },
      });

      for (const subscription of subscriptions) {
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

  private async verify(authorizationHeader: string | undefined): Promise<void> {
    const expectedEmail = this.twentyConfigService.get(
      'MESSAGING_GMAIL_PUBSUB_VERIFICATION_EMAIL',
    );

    if (!isNonEmptyString(expectedEmail)) {
      throw new ConnectedAccountSyncWebhookException(
        'MESSAGING_GMAIL_PUBSUB_VERIFICATION_EMAIL is not configured',
        ConnectedAccountSyncWebhookExceptionCode.INVALID_SIGNATURE,
      );
    }

    const idToken = authorizationHeader?.replace(/^Bearer\s+/i, '');

    if (!isNonEmptyString(idToken)) {
      throw new ConnectedAccountSyncWebhookException(
        'Missing Pub/Sub OIDC token',
        ConnectedAccountSyncWebhookExceptionCode.INVALID_SIGNATURE,
      );
    }

    const expectedAudience = `${this.twentyConfigService.get('SERVER_URL')}/${WEBHOOK_SUBSCRIPTION_ROUTE_PATHS.GOOGLE_MESSAGING}`;

    try {
      const ticket = await new OAuth2Client().verifyIdToken({
        idToken,
        audience: expectedAudience,
      });

      const payload = ticket.getPayload();

      if (
        !isDefined(payload) ||
        payload.email !== expectedEmail ||
        payload.email_verified !== true
      ) {
        throw new ConnectedAccountSyncWebhookException(
          'Pub/Sub OIDC token failed verification',
          ConnectedAccountSyncWebhookExceptionCode.INVALID_SIGNATURE,
        );
      }
    } catch (error) {
      if (error instanceof ConnectedAccountSyncWebhookException) {
        throw error;
      }

      throw new ConnectedAccountSyncWebhookException(
        'Pub/Sub OIDC token verification failed',
        ConnectedAccountSyncWebhookExceptionCode.INVALID_SIGNATURE,
      );
    }
  }

  private decodeMessageData(
    body: GooglePubSubPushMessage,
  ): GmailPushDecodedData | undefined {
    const encodedData = body.message?.data;

    if (!isNonEmptyString(encodedData)) {
      return;
    }

    const decoded = JSON.parse(
      Buffer.from(encodedData, 'base64').toString('utf-8'),
    ) as GmailPushDecodedData;

    if (!isNonEmptyString(decoded.emailAddress)) {
      return;
    }

    return decoded;
  }
}
