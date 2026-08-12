import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import {
  type GoogleApiFailure,
  setupGoogleMock,
} from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  queryConnectedAccount,
  queryMessageChannel,
} from 'test/integration/utils/query-messaging.util';
import { resetMessageChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-import-error-mapping@apple.dev';

// Only a death-certificate response revokes a channel. Transport-level auth
// failures (401, 403) are deliberately treated as temporary: a prod incident
// revoked working accounts off transient 401s, so they now retry instead.
const INSUFFICIENT_PERMISSIONS_FAILURES: [string, GoogleApiFailure][] = [
  [
    'a 400 invalid_grant response',
    {
      status: 400,
      reason: 'invalid_grant',
      message: 'Token has been expired or revoked.',
    },
  ],
  [
    'a 400 failedPrecondition response for a disabled mail service',
    {
      status: 400,
      reason: 'failedPrecondition',
      message: 'Mail service not enabled',
    },
  ],
];

const TEMPORARY_FAILURES: [string, GoogleApiFailure][] = [
  [
    'a 401 unauthorized response',
    { status: 401, reason: 'authError', message: 'Invalid Credentials' },
  ],
  [
    'a 403 insufficientPermissions response',
    {
      status: 403,
      reason: 'insufficientPermissions',
      message: 'Request had insufficient authentication scopes.',
    },
  ],
  [
    'a 403 domainPolicy response',
    {
      status: 403,
      reason: 'domainPolicy',
      message: 'The domain policy has disabled third-party Drive apps',
    },
  ],
  [
    'a 500 response with an unmapped reason',
    { status: 500, reason: 'somethingElse', message: 'Internal error' },
  ],
  [
    'a response with an unmapped status',
    { status: 418, reason: 'teapot', message: 'I am a teapot' },
  ],
  [
    'a 403 rate limit response',
    {
      status: 403,
      reason: 'rateLimitExceeded',
      message: 'Rate Limit Exceeded',
    },
  ],
  [
    'a 400 failedPrecondition response unrelated to the mail service',
    {
      status: 400,
      reason: 'failedPrecondition',
      message: 'Precondition check failed.',
    },
  ],
  [
    'a 503 service unavailable response',
    {
      status: 503,
      reason: 'backendError',
      message: 'The service is currently unavailable.',
    },
  ],
  [
    'a 500 backendError response',
    { status: 500, reason: 'backendError', message: 'Backend Error' },
  ],
];

const UNKNOWN_FAILURES: [string, GoogleApiFailure][] = [
  [
    'a 400 response with an unmapped reason',
    { status: 400, reason: 'invalidArgument', message: 'Invalid query' },
  ],
];

describe('Gmail import error mapping (integration)', () => {
  const gmail = setupGoogleMock({ handle: HANDLE });

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
    await resetMessageChannelSyncState(channel.channelId);

    await getCoreRepository<ConnectedAccountEntity>(
      ConnectedAccountEntity,
    ).update({ id: channel.connectedAccountId }, { authFailedAt: null });
  });

  it.each(INSUFFICIENT_PERMISSIONS_FAILURES)(
    'fails the channel as insufficient-permissions on %s',
    async (_label, failure) => {
      gmail.failMessageList(failure);

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
      gmail.failMessageList(failure);

      await runMessageChannelSync(channel.channelId);

      const channelState = await queryMessageChannel(channel);

      expect(channelState.throttleFailureCount).toBe(1);
      expect(channelState.syncStage).toBe(
        MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      );
      expect(channelState.syncStatus).not.toBe(
        MessageChannelSyncStatus.FAILED_UNKNOWN,
      );
      expect(channelState.syncStatus).not.toBe(
        MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      );
    },
    60000,
  );

  it.each(UNKNOWN_FAILURES)(
    'fails the channel as unknown on %s',
    async (_label, failure) => {
      gmail.failMessageList(failure);

      await runMessageChannelSync(channel.channelId);

      const channelState = await queryMessageChannel(channel);

      expect(channelState.syncStatus).toBe(
        MessageChannelSyncStatus.FAILED_UNKNOWN,
      );
      expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
      expect(channelState.throttleFailureCount).toBe(0);
    },
    60000,
  );

  it('restarts the channel from a clean cursor on a 404 sync cursor error', async () => {
    gmail.failMessageList({
      status: 404,
      reason: 'notFound',
      message: 'Requested entity was not found.',
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
    expect(channelState.syncStageStartedAt).toBeNull();

    const storedChannel = await getCoreRepository<MessageChannelEntity>(
      MessageChannelEntity,
    ).findOneByOrFail({ id: channel.channelId });

    expect(storedChannel.syncCursor).toBeFalsy();
  }, 60000);
});
