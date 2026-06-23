import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { OAuth2Client } from 'google-auth-library';
import {
  ConnectedAccountProvider,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
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
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
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

    const connectedAccountIds = connectedAccounts.map(
      (connectedAccount) => connectedAccount.id,
    );

    if (connectedAccountIds.length === 0) {
      return;
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: {
        connectedAccountId: In(connectedAccountIds),
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
      },
    });

    for (const messageChannel of messageChannels) {
      await this.webhookSyncTriggerService.triggerMessagingSync(
        messageChannel.id,
        messageChannel.workspaceId,
      );
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

    const expectedAudience = `${this.twentyConfigService.get('SERVER_URL')}/webhooks/google/messaging`;

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
