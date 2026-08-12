import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MICROSOFT_PERMANENT_ACCOUNT_ERROR_CODES } from 'src/modules/connected-account/constants/microsoft-permanent-account-error-codes.constant';

import {
  type MicrosoftGraphFailure,
  setupMicrosoftMock,
} from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  queryConnectedAccount,
  queryMessageChannel,
} from 'test/integration/utils/query-messaging.util';
import { resetMessageChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'microsoft-import-error-mapping@apple.dev';

const TEMPORARY_FAILURES: [string, MicrosoftGraphFailure][] = [
  [
    'a 429 throttled response',
    {
      status: 429,
      code: 'ApplicationThrottled',
      message: 'Too many requests',
    },
  ],
  [
    'a 500 response',
    { status: 500, code: 'InternalServerError', message: 'Internal error' },
  ],
  [
    'a 503 response',
    { status: 503, code: 'ServiceUnavailable', message: 'Service unavailable' },
  ],
];

describe('Microsoft messaging import error mapping (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
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

  it.each(MICROSOFT_PERMANENT_ACCOUNT_ERROR_CODES)(
    'fails the channel as insufficient-permissions on the permanent account error %s',
    async (code) => {
      microsoft.failMessageDelta({
        status: 403,
        code,
        message: 'The mailbox is unavailable',
      });

      await runMessageChannelSync(channel.channelId);

      const channelState = await queryMessageChannel(channel);

      expect(channelState.syncStatus).toBe(
        MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      );
      expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);

      const account = await queryConnectedAccount(channel.connectedAccountId);

      expect(account.authFailedAt).not.toBeNull();
    },
    60000,
  );

  it.each(TEMPORARY_FAILURES)(
    'throttles the channel without failing it on %s',
    async (_label, failure) => {
      microsoft.failMessageDelta(failure);

      await runMessageChannelSync(channel.channelId);

      const channelState = await queryMessageChannel(channel);

      expect(channelState.throttleFailureCount).toBe(1);
      expect(channelState.syncStage).toBe(
        MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      );
      expect(channelState.syncStatus).not.toBe(
        MessageChannelSyncStatus.FAILED_UNKNOWN,
      );
    },
    60000,
  );

  it('fails the channel as unknown on a 400 bad request', async () => {
    microsoft.failMessageDelta({
      status: 400,
      code: 'BadRequest',
      message: 'Invalid delta token',
    });

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);

  it('fails the channel as unknown when the message list is not found', async () => {
    microsoft.failMessageDelta({
      status: 404,
      code: 'ResourceNotFound',
      message: 'Resource not found',
    });

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);

  it('restarts the channel from a clean cursor on a 410 expired delta token', async () => {
    microsoft.failMessageDelta({
      status: 410,
      code: 'syncStateNotFound',
      message: 'The delta token is expired',
    });

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStage).toBe(
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );
    expect(channelState.syncStatus).not.toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.throttleFailureCount).toBe(0);

    const storedChannel = await getCoreRepository<MessageChannelEntity>(
      MessageChannelEntity,
    ).findOneByOrFail({ id: channel.channelId });

    expect(storedChannel.syncCursor).toBeFalsy();
  }, 60000);
});
