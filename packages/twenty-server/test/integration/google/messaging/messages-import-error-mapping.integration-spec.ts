import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { queryMessageChannel } from 'test/integration/utils/query-messaging.util';
import { resetMessageChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-messages-import-errors@apple.dev';

describe('Gmail messages import error mapping (integration)', () => {
  const inbox = [gmailMessage()];
  const expectedSubjects = inbox.map(getGmailMessageSubject);

  const gmail = setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  beforeEach(async () => {
    await resetMessageChannelSyncState(channel.channelId, '');

    await getCoreRepository<ConnectedAccountEntity>(
      ConnectedAccountEntity,
    ).update({ id: channel.connectedAccountId }, { authFailedAt: null });
  });

  it.each([404, 410])(
    'skips a message that returns %s and completes the sync',
    async (status) => {
      gmail.failMessageFetch({
        status,
        reason: 'notFound',
        message: 'Requested entity was not found.',
      });

      await runMessageChannelSync(channel.channelId);

      const channelState = await queryMessageChannel(channel);

      expect(channelState.syncStatus).toBe(MessageChannelSyncStatus.ACTIVE);
      expect(channelState.syncStage).toBe(
        MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      );
      expect(await findImportedMessageSubjects(expectedSubjects)).toEqual([]);
    },
    60000,
  );

  it('sends the channel back to the messages-import stage on a throttled message fetch', async () => {
    gmail.failMessageFetch({
      status: 429,
      reason: 'rateLimitExceeded',
      message: 'Rate Limit Exceeded',
    });

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.throttleFailureCount).toBe(1);
    expect(channelState.syncStage).toBe(
      MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
    );
    expect(channelState.syncStatus).not.toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
  }, 60000);

  it('fails the channel as insufficient-permissions when the message fetch is unauthorized', async () => {
    gmail.failMessageFetch({
      status: 401,
      reason: 'authError',
      message: 'Invalid Credentials',
    });

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);

  it('fails the channel as unknown when the message fetch returns an unmapped status', async () => {
    gmail.failMessageFetch({
      status: 418,
      reason: 'teapot',
      message: 'I am a teapot',
    });

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);
});
