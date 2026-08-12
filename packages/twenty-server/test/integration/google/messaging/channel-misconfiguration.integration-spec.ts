import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { queryMessageChannel } from 'test/integration/utils/query-messaging.util';
import { resetMessageChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-channel-misconfiguration@apple.dev';

describe('Gmail channel misconfiguration (integration)', () => {
  // A message without a historyId leaves the full sync with no cursor to store,
  // which is what raises NO_NEXT_SYNC_CURSOR.
  const inbox = [gmailMessage({ historyId: undefined })];

  setupGoogleMock({ handle: HANDLE, inbox });

  const connectedAccountRepository = getCoreRepository<ConnectedAccountEntity>(
    ConnectedAccountEntity,
  );

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let handleAliases: string[] | null;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    handleAliases = (
      await connectedAccountRepository.findOneByOrFail({
        id: channel.connectedAccountId,
      })
    ).handleAliases;
  }, 60000);

  afterAll(async () => {
    await connectedAccountRepository
      .update({ id: channel?.connectedAccountId }, { handleAliases })
      .catch(() => undefined);
    await channel?.cleanup().catch(() => undefined);
  });

  beforeEach(async () => {
    await resetMessageChannelSyncState(channel.channelId, '');
  });

  it('fails the channel when the connected account has no handle aliases', async () => {
    await connectedAccountRepository.update(
      { id: channel.connectedAccountId },
      { handleAliases: null },
    );

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);

  it('fails the channel when the full sync yields no next sync cursor', async () => {
    await connectedAccountRepository.update(
      { id: channel.connectedAccountId },
      { handleAliases },
    );

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);
});
