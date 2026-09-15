import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarOngoingStaleCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-ongoing-stale.cron.job';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { queryCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { runSyncCron } from 'test/integration/utils/run-sync-cron.util';

const STALE_HANDLE = 'calendar-stale-sync@apple.dev';
const RECENT_HANDLE = 'calendar-recent-sync@apple.dev';

const STALE_STARTED_AT = new Date(Date.now() - 61 * 60 * 1000);
const RECENT_STARTED_AT = new Date(Date.now() - 60 * 1000);

describe('Calendar stale-sync recovery (integration)', () => {
  const gmail = setupGoogleMock({ handle: STALE_HANDLE });

  let staleChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let recentChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    staleChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: STALE_HANDLE,
    });

    gmail.actAsAccount(RECENT_HANDLE);

    recentChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: RECENT_HANDLE,
    });

    for (const connectedChannel of [staleChannel, recentChannel]) {
      const channelState = await queryCalendarChannel(connectedChannel);

      expect(channelState.syncStage).toBe(
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
      );
    }
  }, 120000);

  afterAll(async () => {
    await staleChannel?.cleanup().catch(() => undefined);
    await recentChannel?.cleanup().catch(() => undefined);
  });

  it('resets a stale ongoing channel to pending and leaves a recent one running', async () => {
    const calendarChannelRepository = getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    );

    await calendarChannelRepository.update(
      { id: staleChannel.calendarChannelId },
      {
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
        syncStageStartedAt: STALE_STARTED_AT,
      },
    );

    await calendarChannelRepository.update(
      { id: recentChannel.calendarChannelId },
      {
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
        syncStageStartedAt: RECENT_STARTED_AT,
      },
    );

    await runSyncCron(CalendarOngoingStaleCronJob);

    const staleChannelAfter = await queryCalendarChannel(staleChannel);

    expect(staleChannelAfter.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    );
    expect(staleChannelAfter.syncStageStartedAt).toBeNull();

    const recentChannelAfter = await queryCalendarChannel(recentChannel);

    expect(recentChannelAfter.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
    );
  }, 60000);
});
