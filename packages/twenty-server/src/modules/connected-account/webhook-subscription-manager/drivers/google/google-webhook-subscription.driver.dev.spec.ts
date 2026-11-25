import { Test } from '@nestjs/testing';

import { google } from 'googleapis';
import { WebhookSubscriptionChannelType } from 'twenty-shared/types';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { GoogleWebhookSubscriptionDriver } from 'src/modules/connected-account/webhook-subscription-manager/drivers/google/google-webhook-subscription.driver';

const accessToken = process.env.GOOGLE_DEV_ACCESS_TOKEN ?? '';
const connectedAccountId = 'dev-connected-account';

const buildDriver = async ({
  serverUrl = 'https://twenty-probe.invalid',
  pubSubTopic = 'projects/twenty-auth-dev/topics/gmail',
  token = accessToken,
}: {
  serverUrl?: string;
  pubSubTopic?: string;
  token?: string;
} = {}) => {
  const oAuth2Client = new google.auth.OAuth2();

  oAuth2Client.setCredentials({ access_token: token });

  const module = await Test.createTestingModule({
    providers: [
      GoogleWebhookSubscriptionDriver,
      {
        provide: GoogleOAuth2ClientProvider,
        useValue: { getClient: async () => oAuth2Client },
      },
      {
        provide: TwentyConfigService,
        useValue: {
          get: (key: string) =>
            key === 'MESSAGING_GMAIL_PUBSUB_TOPIC' ? pubSubTopic : serverUrl,
        },
      },
    ],
  }).compile();

  return module.get(GoogleWebhookSubscriptionDriver);
};

const expectDriverExceptionCode = async (
  operation: Promise<unknown>,
  expected: WebhookSubscriptionDriverExceptionCode,
) => {
  await expect(operation).rejects.toBeInstanceOf(
    WebhookSubscriptionDriverException,
  );
  await expect(operation).rejects.toMatchObject({ code: expected });
};

xdescribe('Google dev tests : webhook subscription driver', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  it('should map a stopped channel that no longer exists to NOT_FOUND', async () => {
    await expectDriverExceptionCode(
      (await buildDriver()).deleteSubscription({
        connectedAccountId,
        channelType: WebhookSubscriptionChannelType.CALENDAR,
        externalSubscriptionId: '00000000-0000-4000-8000-000000000000',
        externalResourceId: 'does-not-exist',
        clientState: 'dev',
      }),
      WebhookSubscriptionDriverExceptionCode.NOT_FOUND,
    );
  });

  it('should map a non-https notification url to UNKNOWN', async () => {
    await expectDriverExceptionCode(
      (
        await buildDriver({
          serverUrl: 'http://insecure.example.com',
        })
      ).createSubscription(
        connectedAccountId,
        WebhookSubscriptionChannelType.CALENDAR,
        'dev',
      ),
      WebhookSubscriptionDriverExceptionCode.UNKNOWN,
    );
  });

  it('should map a pubsub topic owned by another project to UNKNOWN', async () => {
    await expectDriverExceptionCode(
      (
        await buildDriver({
          pubSubTopic: 'projects/twenty-probe-nonexistent/topics/nope',
        })
      ).createSubscription(
        connectedAccountId,
        WebhookSubscriptionChannelType.MESSAGING,
        'dev',
      ),
      WebhookSubscriptionDriverExceptionCode.UNKNOWN,
    );
  });

  it('should map an expired access token to INSUFFICIENT_PERMISSIONS', async () => {
    await expectDriverExceptionCode(
      (await buildDriver({ token: 'not-a-real-token' })).createSubscription(
        connectedAccountId,
        WebhookSubscriptionChannelType.CALENDAR,
        'dev',
      ),
      WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });
});
