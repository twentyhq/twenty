import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarEventsImportCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-events-import.cron.job';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { queryCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { runSyncCron } from 'test/integration/utils/run-sync-cron.util';

const PENDING_HANDLE = 'calendar-import-cron-pending@apple.dev';
const THROTTLED_HANDLE = 'calendar-import-cron-throttled@apple.dev';

describe('Calendar events import cron scheduling (integration)', () => {
  const gmail = setupGoogleMock({ handle: PENDING_HANDLE });

  let pendingChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let throttledChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    pendingChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: PENDING_HANDLE,
    });

    gmail.actAsAccount(THROTTLED_HANDLE);

    throttledChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: THROTTLED_HANDLE,
    });

    const calendarChannelRepository = getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    );

    await calendarChannelRepository.update(
      { id: pendingChannel.calendarChannelId },
      {
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
        syncStageStartedAt: null,
        throttleFailureCount: 0,
      },
    );

    await calendarChannelRepository.update(
      { id: throttledChannel.calendarChannelId },
      {
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
        syncStageStartedAt: new Date().toISOString(),
        throttleFailureCount: 1,
      },
    );
  }, 120000);

  afterAll(async () => {
    await pendingChannel?.cleanup().catch(() => undefined);
    await throttledChannel?.cleanup().catch(() => undefined);
  });

  it('schedules a pending calendar channel for import and skips a throttled one', async () => {
    await runSyncCron(CalendarEventsImportCronJob);

    const pendingChannelAfter = await queryCalendarChannel(pendingChannel);

    expect(pendingChannelAfter.syncStage).not.toBe(
      CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );
    expect(pendingChannelAfter.syncStageStartedAt).not.toBeNull();
    expect(pendingChannelAfter.syncStatus).not.toBe(
      CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(pendingChannelAfter.syncStatus).not.toBe(
      CalendarChannelSyncStatus.FAILED_UNKNOWN,
    );

    const throttledChannelAfter = await queryCalendarChannel(throttledChannel);

    expect(throttledChannelAfter.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );
    expect(throttledChannelAfter.throttleFailureCount).toBe(1);
  }, 60000);
});
