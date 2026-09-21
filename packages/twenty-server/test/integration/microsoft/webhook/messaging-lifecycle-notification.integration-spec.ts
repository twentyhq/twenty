import request from 'supertest';
import {
  ConnectedAccountProvider,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'microsoft-messaging-lifecycle@apple.dev';
const CLIENT_STATE = 'messaging-lifecycle-client-state';
const REMOVED_SUBSCRIPTION_ID = 'messaging-subscription-removed';

const postLifecycleNotification = (lifecycleEvent: string, overrides = {}) =>
  request(`http://localhost:${APP_PORT}`)
    .post('/webhooks/microsoft/messaging')
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

describe('Microsoft messaging webhook lifecycle notifications (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let account: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const messageChannelRepository = () =>
    getCoreRepository<MessageChannelEntity>(MessageChannelEntity);

  const readChannel = async () =>
    await messageChannelRepository().findOneOrFail({
      where: { id: account.channelId },
    });

  beforeAll(async () => {
    account = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 120000);

  beforeEach(async () => {
    microsoft.subscriptions.reset();
    await messageChannelRepository().update(account.channelId, {
      webhookSubscriptionExternalId: REMOVED_SUBSCRIPTION_ID,
      webhookSubscriptionClientState: CLIENT_STATE,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
      webhookSubscriptionExpiresAt: new Date(Date.now() + 3600 * 1000),
    });
  });

  afterAll(async () => {
    await account?.cleanup().catch(() => undefined);
  });

  it('creates a replacement subscription when Microsoft reports it was removed', async () => {
    await postLifecycleNotification('subscriptionRemoved').expect(200);

    await waitForAllJobsToFinish();

    expect(microsoft.subscriptions.created).toHaveLength(1);
    expect(microsoft.subscriptions.renewed).not.toContain(
      REMOVED_SUBSCRIPTION_ID,
    );

    const channel = await readChannel();

    expect(channel.webhookSubscriptionExternalId).not.toBe(
      REMOVED_SUBSCRIPTION_ID,
    );
    expect(channel.webhookSubscriptionStatus).toBe(
      WebhookSubscriptionStatus.ACTIVE,
    );
  }, 60000);

  it('creates only one replacement when the same removal is delivered twice', async () => {
    await Promise.all([
      postLifecycleNotification('subscriptionRemoved'),
      postLifecycleNotification('subscriptionRemoved'),
    ]);

    await waitForAllJobsToFinish();

    expect(microsoft.subscriptions.created).toHaveLength(1);
  }, 60000);

  it('renews in place when Microsoft asks for reauthorization', async () => {
    await postLifecycleNotification('reauthorizationRequired').expect(200);

    await waitForAllJobsToFinish();

    expect(microsoft.subscriptions.renewed).toContain(REMOVED_SUBSCRIPTION_ID);
    expect(microsoft.subscriptions.created).toHaveLength(0);
  }, 60000);

  it('leaves the subscription untouched on a missed notification', async () => {
    await postLifecycleNotification('missed').expect(200);

    await waitForAllJobsToFinish();

    expect(microsoft.subscriptions.created).toHaveLength(0);
    expect(microsoft.subscriptions.renewed).toHaveLength(0);
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
});
