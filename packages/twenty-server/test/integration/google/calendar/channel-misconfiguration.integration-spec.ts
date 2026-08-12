import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { queryCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'google-calendar-misconfiguration@apple.dev';

describe('Google calendar channel misconfiguration (integration)', () => {
  const gmail = setupGoogleMock({ handle: HANDLE });

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

  it('fails the calendar channel when the connected account has no handle aliases', async () => {
    gmail.serveCalendarEvents(
      [googleCalendarEvent({ summary: `Calendar event ${randomUUID()}` })],
      { nextSyncToken: `sync-token-${randomUUID()}` },
    );

    await resetCalendarChannelSyncState(channel.calendarChannelId, '');

    await connectedAccountRepository.update(
      { id: channel.connectedAccountId },
      { handleAliases: null },
    );

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStatus).toBe(
      CalendarChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(CalendarChannelSyncStage.FAILED);
  }, 120000);
});
