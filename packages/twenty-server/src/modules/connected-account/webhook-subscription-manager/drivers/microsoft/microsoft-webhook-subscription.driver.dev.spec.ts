import { Client } from '@microsoft/microsoft-graph-client';
import { WebhookSubscriptionChannelType } from 'twenty-shared/types';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { MicrosoftWebhookSubscriptionDriver } from 'src/modules/connected-account/webhook-subscription-manager/drivers/microsoft/microsoft-webhook-subscription.driver';

const accessToken = process.env.MICROSOFT_DEV_ACCESS_TOKEN ?? '';
const connectedAccountId = 'dev-connected-account';
const goneSubscriptionId = '00000000-0000-4000-8000-000000000000';

const buildDriver = ({
  serverUrl = 'https://twenty-probe-does-not-exist.invalid',
  token = accessToken,
}: { serverUrl?: string; token?: string } = {}) => {
  const oAuth2ClientProvider = {
    getClient: async () =>
      Client.init({ authProvider: (done) => done(null, token) }),
  } as unknown as MicrosoftOAuth2ClientProvider;

  const twentyConfigService = {
    get: () => serverUrl,
  } as unknown as TwentyConfigService;

  return new MicrosoftWebhookSubscriptionDriver(
    oAuth2ClientProvider,
    twentyConfigService,
  );
};

const context = {
  connectedAccountId,
  channelType: WebhookSubscriptionChannelType.CALENDAR,
  externalSubscriptionId: goneSubscriptionId,
  externalResourceId: null,
  clientState: 'dev',
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

xdescribe('Microsoft dev tests : webhook subscription driver', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  it('should map renewing a removed subscription to NOT_FOUND', async () => {
    await expectDriverExceptionCode(
      buildDriver().renewSubscription(context),
      WebhookSubscriptionDriverExceptionCode.NOT_FOUND,
    );
  });

  it('should map deleting a removed subscription to NOT_FOUND', async () => {
    await expectDriverExceptionCode(
      buildDriver().deleteSubscription(context),
      WebhookSubscriptionDriverExceptionCode.NOT_FOUND,
    );
  });

  it('should map an unreachable notification url to UNKNOWN', async () => {
    await expectDriverExceptionCode(
      buildDriver().createSubscription(
        connectedAccountId,
        WebhookSubscriptionChannelType.CALENDAR,
        'dev',
      ),
      WebhookSubscriptionDriverExceptionCode.UNKNOWN,
    );
  });

  it('should map an expired access token to TEMPORARY_ERROR', async () => {
    await expectDriverExceptionCode(
      buildDriver({ token: 'not-a-real-token' }).renewSubscription(context),
      WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
    );
  });
});
