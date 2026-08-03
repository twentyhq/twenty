import {
  ConnectedAccountProvider,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-max-attempts.constant';
import { WebhookSubscriptionRenewalCronJob } from 'src/modules/connected-account/webhook-subscription-manager/crons/jobs/webhook-subscription-renewal.cron.job';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runSyncCron } from 'test/integration/utils/run-sync-cron.util';

const HANDLE = 'webhook-renewal@apple.dev';

describe('Webhook subscription renewal bounded retry (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let account: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const calendarChannelRepository = () =>
    getCoreRepository<CalendarChannelEntity>(CalendarChannelEntity);

  const setCalendarChannel = (
    fields: QueryDeepPartialEntity<CalendarChannelEntity>,
  ) =>
    calendarChannelRepository().update(
      { id: account.calendarChannelId },
      fields,
    );

  const getCalendarChannel = () =>
    calendarChannelRepository().findOneByOrFail({
      id: account.calendarChannelId,
    });

  const markFailedFromScratch = (webhookSubscriptionFailureCount: number) =>
    setCalendarChannel({
      webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
      webhookSubscriptionFailureCount,
      webhookSubscriptionExternalId: null,
      webhookSubscriptionExternalResourceId: null,
      webhookSubscriptionExpiresAt: null,
    });

  beforeAll(async () => {
    account = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 120000);

  afterAll(async () => {
    await account?.cleanup().catch(() => undefined);
  });

  it('records a failure and keeps the channel retryable while under the attempt budget', async () => {
    google.failCalendarWatch();

    await markFailedFromScratch(0);

    await runSyncCron(WebhookSubscriptionRenewalCronJob);

    const channel = await getCalendarChannel();

    expect(channel.webhookSubscriptionFailureCount).toBe(1);
    expect(channel.webhookSubscriptionStatus).toBe(
      WebhookSubscriptionStatus.FAILED,
    );
  }, 60000);

  it('stops retrying once the attempt budget is exhausted', async () => {
    google.failCalendarWatch();

    await markFailedFromScratch(WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS - 1);

    await runSyncCron(WebhookSubscriptionRenewalCronJob);

    let channel = await getCalendarChannel();

    expect(channel.webhookSubscriptionFailureCount).toBe(
      WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS,
    );
    expect(channel.webhookSubscriptionStatus).toBe(
      WebhookSubscriptionStatus.FAILED,
    );

    // A channel at the cap must no longer be picked up: the previous infinite
    // hourly loop is what this guards against.
    await runSyncCron(WebhookSubscriptionRenewalCronJob);

    channel = await getCalendarChannel();

    expect(channel.webhookSubscriptionFailureCount).toBe(
      WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS,
    );
  }, 60000);

  it('resets the failure count after a successful renewal', async () => {
    await markFailedFromScratch(WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS - 1);

    await runSyncCron(WebhookSubscriptionRenewalCronJob);

    const channel = await getCalendarChannel();

    expect(channel.webhookSubscriptionStatus).toBe(
      WebhookSubscriptionStatus.ACTIVE,
    );
    expect(channel.webhookSubscriptionFailureCount).toBe(0);
    expect(channel.webhookSubscriptionExpiresAt).not.toBeNull();
  }, 60000);
});
