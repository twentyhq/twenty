import request from 'supertest';
import {
  ConnectedAccountProvider,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WEBHOOK_SUBSCRIPTION_MAX_FAILURE_COUNT } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-max-failure-count.constant';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'microsoft-webhook-lifecycle@apple.dev';
const CLIENT_STATE = 'lifecycle-client-state';
const REMOVED_SUBSCRIPTION_ID = 'subscription-removed-by-microsoft';

const postLifecycleNotification = (lifecycleEvent: string, overrides = {}) =>
  request(`http://localhost:${APP_PORT}`)
    .post('/webhooks/microsoft/calendar')
    .send({
      value: [
        {
          subscriptionId: REMOVED_SUBSCRIPTION_ID,
          clientState: CLIENT_STATE,
          lifecycleEvent,
          tenantId: 'mock-tenant',
          ...overrides,
        },
      ],
    });

describe('Microsoft webhook lifecycle notifications (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let account: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const calendarChannelRepository = () =>
    getCoreRepository<CalendarChannelEntity>(CalendarChannelEntity);

  const readChannel = async () =>
    await calendarChannelRepository().findOneOrFail({
      where: { id: account.calendarChannelId },
    });

  const giveChannelAnActiveSubscription = async () => {
    await calendarChannelRepository().update(account.calendarChannelId, {
      webhookSubscriptionExternalId: REMOVED_SUBSCRIPTION_ID,
      webhookSubscriptionClientState: CLIENT_STATE,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
      webhookSubscriptionExpiresAt: new Date(Date.now() + 3600 * 1000),
      webhookSubscriptionFailureCount: 0,
    });
  };

  beforeAll(async () => {
    account = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 120000);

  beforeEach(async () => {
    microsoft.subscriptions.reset();
    await giveChannelAnActiveSubscription();
  });

  afterAll(async () => {
    await account?.cleanup().catch(() => undefined);
  });

  it('creates a replacement subscription when Microsoft reports it was removed', async () => {
    await postLifecycleNotification('subscriptionRemoved').expect(200);

    await waitForAllJobsToFinish();

    expect(microsoft.subscriptions.created).toHaveLength(1);

    const channel = await readChannel();

    expect(channel.webhookSubscriptionExternalId).not.toBe(
      REMOVED_SUBSCRIPTION_ID,
    );
    expect(channel.webhookSubscriptionStatus).toBe(
      WebhookSubscriptionStatus.ACTIVE,
    );
  }, 60000);

  it('never patches the removed subscription', async () => {
    await postLifecycleNotification('subscriptionRemoved').expect(200);

    await waitForAllJobsToFinish();

    expect(microsoft.subscriptions.renewed).not.toContain(
      REMOVED_SUBSCRIPTION_ID,
    );
  }, 60000);

  it('renews in place when Microsoft asks for reauthorization', async () => {
    await postLifecycleNotification('reauthorizationRequired').expect(200);

    await waitForAllJobsToFinish();

    expect(microsoft.subscriptions.renewed).toContain(REMOVED_SUBSCRIPTION_ID);
    expect(microsoft.subscriptions.created).toHaveLength(0);

    const channel = await readChannel();

    expect(channel.webhookSubscriptionExternalId).toBe(REMOVED_SUBSCRIPTION_ID);
  }, 60000);

  it('leaves the subscription untouched on a missed notification', async () => {
    await postLifecycleNotification('missed').expect(200);

    await waitForAllJobsToFinish();

    expect(microsoft.subscriptions.created).toHaveLength(0);
    expect(microsoft.subscriptions.renewed).toHaveLength(0);

    const channel = await readChannel();

    expect(channel.webhookSubscriptionExternalId).toBe(REMOVED_SUBSCRIPTION_ID);
  }, 60000);

  it('ignores a lifecycle event it does not recognize', async () => {
    await postLifecycleNotification('someFutureLifecycleEvent').expect(200);

    await waitForAllJobsToFinish();

    expect(microsoft.subscriptions.created).toHaveLength(0);
    expect(microsoft.subscriptions.renewed).toHaveLength(0);
  }, 60000);

  it('ignores a notification whose client state does not match', async () => {
    await postLifecycleNotification('subscriptionRemoved', {
      clientState: 'forged-client-state',
    }).expect(200);

    await waitForAllJobsToFinish();

    expect(microsoft.subscriptions.created).toHaveLength(0);

    const channel = await readChannel();

    expect(channel.webhookSubscriptionExternalId).toBe(REMOVED_SUBSCRIPTION_ID);
  }, 60000);

  it('counts a temporary renewal failure and leaves the subscription retryable', async () => {
    microsoft.failSubscriptionRenewalTemporarily();

    await postLifecycleNotification('reauthorizationRequired').expect(200);

    await waitForAllJobsToFinish();

    const channel = await readChannel();

    expect(channel.webhookSubscriptionStatus).toBe(
      WebhookSubscriptionStatus.FAILED,
    );
    expect(channel.webhookSubscriptionFailureCount).toBe(1);
  }, 60000);

  it('expires the subscription once renewal has failed the maximum number of times', async () => {
    microsoft.failSubscriptionRenewalTemporarily();

    await calendarChannelRepository().update(account.calendarChannelId, {
      webhookSubscriptionFailureCount: WEBHOOK_SUBSCRIPTION_MAX_FAILURE_COUNT,
    });

    await postLifecycleNotification('reauthorizationRequired').expect(200);

    await waitForAllJobsToFinish();

    const channel = await readChannel();

    expect(channel.webhookSubscriptionStatus).toBe(
      WebhookSubscriptionStatus.EXPIRED,
    );
    expect(channel.webhookSubscriptionFailureCount).toBe(
      WEBHOOK_SUBSCRIPTION_MAX_FAILURE_COUNT,
    );
  }, 60000);

  it('clears the failure count when a renewal succeeds', async () => {
    await calendarChannelRepository().update(account.calendarChannelId, {
      webhookSubscriptionFailureCount: WEBHOOK_SUBSCRIPTION_MAX_FAILURE_COUNT - 1,
    });

    await postLifecycleNotification('reauthorizationRequired').expect(200);

    await waitForAllJobsToFinish();

    const channel = await readChannel();

    expect(channel.webhookSubscriptionStatus).toBe(
      WebhookSubscriptionStatus.ACTIVE,
    );
    expect(channel.webhookSubscriptionFailureCount).toBe(0);
  }, 60000);

  it('clears the subscription when renewal reports the resource is gone', async () => {
    microsoft.failSubscriptionRenewal();

    await postLifecycleNotification('reauthorizationRequired').expect(200);

    await waitForAllJobsToFinish();

    const channel = await readChannel();

    expect(channel.webhookSubscriptionStatus).toBe(
      WebhookSubscriptionStatus.FAILED,
    );
    expect(channel.webhookSubscriptionExternalId).toBeNull();
  }, 60000);
});
