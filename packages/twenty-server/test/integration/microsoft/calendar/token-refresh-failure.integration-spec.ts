import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  queryCalendarChannel,
  queryConnectedAccount,
} from 'test/integration/utils/query-messaging.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'microsoft-calendar-revoked@apple.dev';

const EXPIRED_CREDENTIALS_AT = new Date(Date.now() - 56 * 60 * 1000);

describe('Microsoft calendar token refresh failure (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 120000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('fails the channel as insufficient-permissions when the refresh token is declined', async () => {
    // resolveTokens short-circuits on a still-valid access token, so the refresh
    // token is only consulted once lastCredentialsRefreshedAt is stale.
    await getCoreRepository<ConnectedAccountEntity>(
      ConnectedAccountEntity,
    ).update(
      { id: channel.connectedAccountId },
      { lastCredentialsRefreshedAt: EXPIRED_CREDENTIALS_AT },
    );

    microsoft.declineTokenRefresh();

    await runCalendarChannelListFetch(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStatus).toBe(
      CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(channelState.syncStage).toBe(CalendarChannelSyncStage.FAILED);

    const account = await queryConnectedAccount(channel.connectedAccountId);

    expect(account.authFailedAt).not.toBeNull();
  }, 60000);
});
