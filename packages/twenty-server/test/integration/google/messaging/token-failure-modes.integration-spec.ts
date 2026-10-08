import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { queryMessageChannel } from 'test/integration/utils/query-messaging.util';
import { resetMessageChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-token-failure-modes@apple.dev';

// The refresh service only mints a new token once the stored credentials are
// stale; a recent refresh short-circuits to the tokens already on the account.
const STALE_CREDENTIALS_AT = new Date(Date.now() - 56 * 60 * 1000);
const FRESH_CREDENTIALS_AT = new Date();

describe('Gmail token failure modes (integration)', () => {
  setupGoogleMock({ handle: HANDLE });

  const connectedAccountRepository = getCoreRepository<ConnectedAccountEntity>(
    ConnectedAccountEntity,
  );

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let storedAccount: ConnectedAccountEntity;

  const restoreAccount = () =>
    connectedAccountRepository.update(
      { id: channel.connectedAccountId },
      {
        accessToken: storedAccount.accessToken,
        refreshToken: storedAccount.refreshToken,
        provider: storedAccount.provider,
        lastCredentialsRefreshedAt: storedAccount.lastCredentialsRefreshedAt,
        authFailedAt: null,
      },
    );

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    storedAccount = await connectedAccountRepository.findOneByOrFail({
      id: channel.connectedAccountId,
    });
  }, 60000);

  afterAll(async () => {
    await restoreAccount().catch(() => undefined);
    await channel?.cleanup().catch(() => undefined);
  });

  beforeEach(async () => {
    await restoreAccount();
    await resetMessageChannelSyncState(channel.channelId);
  });

  it('fails the channel as insufficient-permissions when the refresh token is gone', async () => {
    await connectedAccountRepository.update(
      { id: channel.connectedAccountId },
      {
        refreshToken: null,
        lastCredentialsRefreshedAt: STALE_CREDENTIALS_AT,
      },
    );

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);

  it('fails the channel as unknown when the stored access token is gone', async () => {
    await connectedAccountRepository.update(
      { id: channel.connectedAccountId },
      {
        accessToken: null,
        lastCredentialsRefreshedAt: FRESH_CREDENTIALS_AT,
      },
    );

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);

  // The driver rejects the unsupported provider before the refresh service is
  // reached, so this surfaces as a permissions failure.
  it('fails the channel as insufficient-permissions when the provider cannot refresh tokens', async () => {
    await connectedAccountRepository.update(
      { id: channel.connectedAccountId },
      {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        lastCredentialsRefreshedAt: STALE_CREDENTIALS_AT,
      },
    );

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);
});
