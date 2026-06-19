import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WEBHOOK_SUBSCRIPTION_ROUTE_PATHS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription.constants';
import { ConnectedAccountSyncWebhookExceptionCode } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook-exception-code.enum';
import { ConnectedAccountSyncWebhookException } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook.exception';

@Injectable()
export class GooglePubSubPushVerifierService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async verify(authorizationHeader: string | undefined): Promise<void> {
    const expectedEmail = this.twentyConfigService.get(
      'MESSAGING_GMAIL_PUBSUB_VERIFICATION_EMAIL',
    );

    if (!isNonEmptyString(expectedEmail)) {
      throw new ConnectedAccountSyncWebhookException(
        'MESSAGING_GMAIL_PUBSUB_VERIFICATION_EMAIL is not configured',
        ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_INVALID_SIGNATURE,
      );
    }

    const idToken = this.extractBearerToken(authorizationHeader);

    if (!isNonEmptyString(idToken)) {
      throw new ConnectedAccountSyncWebhookException(
        'Missing bearer token on Pub/Sub push request',
        ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_INVALID_SIGNATURE,
      );
    }

    const oAuth2Client = new google.auth.OAuth2();
    const expectedAudience = `${this.twentyConfigService.get('SERVER_URL')}/${WEBHOOK_SUBSCRIPTION_ROUTE_PATHS.GOOGLE_MESSAGING}`;

    try {
      const ticket = await oAuth2Client.verifyIdToken({
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
          'Pub/Sub push token does not match the configured service account',
          ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_INVALID_SIGNATURE,
        );
      }
    } catch (error) {
      if (error instanceof ConnectedAccountSyncWebhookException) {
        throw error;
      }

      throw new ConnectedAccountSyncWebhookException(
        'Failed to verify Pub/Sub push token',
        ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_INVALID_SIGNATURE,
      );
    }
  }

  private extractBearerToken(
    authorizationHeader: string | undefined,
  ): string | undefined {
    if (!isNonEmptyString(authorizationHeader)) {
      return undefined;
    }

    const [scheme, token] = authorizationHeader.split(' ');

    return scheme === 'Bearer' ? token : undefined;
  }
}
