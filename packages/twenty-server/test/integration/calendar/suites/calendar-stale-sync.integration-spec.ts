import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarOngoingStaleCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-ongoing-stale.cron.job';
import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import { googleAccountIdentityHandlers } from 'test/integration/messaging/utils/google-auth-mock.util';
import { setupGmailMock } from 'test/integration/messaging/utils/gmail-message-mock.util';
import { queryCalendarChannels } from 'test/integration/messaging/utils/query-messaging.util';
import { enqueueCronAndAwait } from 'test/integration/utils/run-sync-cron.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

const STALE_HANDLE = 'calendar-stale-sync@apple.dev';
const RECENT_HANDLE = 'calendar-recent-sync@apple.dev';

const STALE_STARTED_AT = new Date(Date.now() - 61 * 60 * 1000);
const RECENT_STARTED_AT = new Date(Date.now() - 60 * 1000);

describe('Calendar stale-sync recovery (integration)', () => {
  const gmail = setupGmailMock({ inbox: [], handle: STALE_HANDLE });

  let staleChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let recentChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    staleChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: STALE_HANDLE,
    });

    gmail.use(...googleAccountIdentityHandlers(RECENT_HANDLE));

    recentChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: RECENT_HANDLE,
    });
  }, 120000);

  afterAll(async () => {
    await staleChannel.cleanup();
    await recentChannel.cleanup();
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

    await enqueueCronAndAwait({
      cronQueueName: MessageQueue.cronQueue,
      cronJobName: CalendarOngoingStaleCronJob.name,
      downstreamQueueName: MessageQueue.calendarQueue,
    });

    const staleChannelAfter = await pollUntil(
      async () => {
        const [calendarChannel] = await queryCalendarChannels(
          staleChannel.connectedAccountId,
        );

        return calendarChannel;
      },
      (channelState) =>
        channelState.syncStage ===
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    );

    expect(staleChannelAfter.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    );
    expect(staleChannelAfter.syncStageStartedAt).toBeNull();

    const [recentChannelAfter] = await queryCalendarChannels(
      recentChannel.connectedAccountId,
    );

    expect(recentChannelAfter.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
    );
  }, 60000);
});
