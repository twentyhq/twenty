import {
  ConnectedAccountProvider,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { WebhookSubscriptionRenewalCronJob } from 'src/modules/connected-account/webhook-subscription-manager/crons/jobs/webhook-subscription-renewal.cron.job';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runSyncCron } from 'test/integration/utils/run-sync-cron.util';

const HANDLE = 'microsoft-webhook-renewal-auth@apple.dev';
const CLIENT_STATE = 'renewal-auth-client-state';
const SUBSCRIPTION_ID = 'subscription-due-for-renewal';

describe('Microsoft webhook subscription renewal (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let account: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let storedRefreshToken: EncryptedString | null;

  const calendarChannelRepository = () =>
    getCoreRepository<CalendarChannelEntity>(CalendarChannelEntity);

  const connectedAccountRepository = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);

  const readChannel = async () =>
    await calendarChannelRepository().findOneOrFail({
      where: { id: account.calendarChannelId },
    });

  const makeSubscriptionDueForRenewal = async () => {
    await calendarChannelRepository().update(account.calendarChannelId, {
      webhookSubscriptionExternalId: SUBSCRIPTION_ID,
      webhookSubscriptionClientState: CLIENT_STATE,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
      webhookSubscriptionExpiresAt: new Date(Date.now() + 60 * 1000),
    });
  };

  // resolveTokens short-circuits on a still-valid access token, so the refresh
  // token is only consulted once lastCredentialsRefreshedAt is stale.
  const revokeRefreshToken = async () => {
    await connectedAccountRepository().update(account.connectedAccountId, {
      refreshToken: null,
      lastCredentialsRefreshedAt: null,
    });
  };

  const restoreRefreshToken = async () => {
    await connectedAccountRepository().update(account.connectedAccountId, {
      refreshToken: storedRefreshToken,
      lastCredentialsRefreshedAt: null,
    });
  };

  beforeAll(async () => {
    account = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });

    const connectedAccount = await connectedAccountRepository().findOneOrFail({
      where: { id: account.connectedAccountId },
    });

    storedRefreshToken = connectedAccount.refreshToken;
  }, 120000);

  beforeEach(async () => {
    microsoft.subscriptions.reset();
    await makeSubscriptionDueForRenewal();
  });

  afterAll(async () => {
    await account?.cleanup().catch(() => undefined);
  });

  it('renews a subscription that is close to expiring', async () => {
    await runSyncCron(WebhookSubscriptionRenewalCronJob);

    expect(microsoft.subscriptions.renewed).toContain(SUBSCRIPTION_ID);

    const channel = await readChannel();

    expect(channel.webhookSubscriptionStatus).toBe(
      WebhookSubscriptionStatus.ACTIVE,
    );
  }, 60000);

  describe('when the connected account has no usable refresh token', () => {
    beforeEach(async () => {
      await revokeRefreshToken();
    });

    it('expires the channel rather than marking it failed', async () => {
      await runSyncCron(WebhookSubscriptionRenewalCronJob);

      const channel = await readChannel();

      expect(channel.webhookSubscriptionStatus).toBe(
        WebhookSubscriptionStatus.EXPIRED,
      );
      expect(microsoft.subscriptions.renewed).not.toContain(SUBSCRIPTION_ID);
    }, 60000);

    // Restoring the token before the second run is what makes this meaningful:
    // a re-selected channel would reach the provider and get a subscription.
    it('stops selecting the channel on subsequent cron runs', async () => {
      await runSyncCron(WebhookSubscriptionRenewalCronJob);

      expect((await readChannel()).webhookSubscriptionStatus).toBe(
        WebhookSubscriptionStatus.EXPIRED,
      );

      await restoreRefreshToken();
      microsoft.subscriptions.reset();

      await runSyncCron(WebhookSubscriptionRenewalCronJob);

      const channel = await readChannel();

      expect(channel.webhookSubscriptionStatus).toBe(
        WebhookSubscriptionStatus.EXPIRED,
      );
      expect(channel.webhookSubscriptionExternalId).toBe(SUBSCRIPTION_ID);
      expect(microsoft.subscriptions.created).toHaveLength(0);
      expect(microsoft.subscriptions.renewed).not.toContain(SUBSCRIPTION_ID);
    }, 60000);
  });
});
