import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CALENDAR_THROTTLE_MAX_ATTEMPTS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-throttle-max-attempts';
import { CalendarEventListFetchCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-event-list-fetch.cron.job';
import { CalendarRelaunchFailedCalendarChannelsCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-relaunch-failed-calendar-channels.cron.job';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import { setupGmailMock } from 'test/integration/messaging/utils/gmail-message-mock.util';
import {
  declinedGoogleTokenRefresh,
  googleAccountIdentityHandlers,
} from 'test/integration/messaging/utils/google-auth-mock.util';
import { rateLimitedGoogleCalendarEventList } from 'test/integration/messaging/utils/google-calendar-mock.util';
import {
  queryCalendarChannel,
  queryConnectedAccount,
  updateCalendarChannel,
} from 'test/integration/messaging/utils/query-messaging.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runSyncCron } from 'test/integration/utils/run-sync.util';

const THROTTLED_HANDLE = 'calendar-throttled@apple.dev';
const REVOKED_HANDLE = 'calendar-revoked@apple.dev';

const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
const EXPIRED_CREDENTIALS_AT = new Date(Date.now() - 56 * 60 * 1000);

describe('Calendar sync failure lifecycle (integration)', () => {
  const gmail = setupGmailMock({ inbox: [], handle: THROTTLED_HANDLE });

  let throttledChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let revokedChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    throttledChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: THROTTLED_HANDLE,
    });

    gmail.use(...googleAccountIdentityHandlers(REVOKED_HANDLE));

    revokedChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: REVOKED_HANDLE,
    });

    await updateCalendarChannel(revokedChannel.calendarChannelId, {
      isSyncEnabled: false,
    });
  }, 120000);

  afterAll(async () => {
    await throttledChannel?.cleanup().catch(() => undefined);
    await revokedChannel?.cleanup().catch(() => undefined);
  });

  it('counts a throttle failure on a 429 and keeps the channel alive', async () => {
    gmail.use(rateLimitedGoogleCalendarEventList());

    await runSyncCron(CalendarEventListFetchCronJob);

    const channelState = await queryCalendarChannel(throttledChannel);

    expect(channelState.throttleFailureCount).toBe(1);
    expect(channelState.syncStatus).not.toBe(
      CalendarChannelSyncStatus.FAILED_UNKNOWN,
    );
  }, 60000);

  it('fails the channel as unknown once the throttle attempts are exhausted', async () => {
    gmail.use(rateLimitedGoogleCalendarEventList());

    const calendarChannelRepository = getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    );

    let channelState = await queryCalendarChannel(throttledChannel);

    for (
      let attempt = channelState.throttleFailureCount;
      attempt <= CALENDAR_THROTTLE_MAX_ATTEMPTS &&
      channelState.syncStatus !== CalendarChannelSyncStatus.FAILED_UNKNOWN;
      attempt++
    ) {
      await calendarChannelRepository.update(
        { id: throttledChannel.calendarChannelId },
        { syncStageStartedAt: ONE_HOUR_AGO },
      );

      await runSyncCron(CalendarEventListFetchCronJob);

      channelState = await queryCalendarChannel(throttledChannel);
    }

    expect(channelState.syncStatus).toBe(
      CalendarChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(CalendarChannelSyncStage.FAILED);
  }, 120000);

  it('fails the channel as insufficient-permissions when the refresh token is declined', async () => {
    await updateCalendarChannel(revokedChannel.calendarChannelId, {
      isSyncEnabled: true,
    });

    await getCoreRepository<ConnectedAccountEntity>(
      ConnectedAccountEntity,
    ).update(
      { id: revokedChannel.connectedAccountId },
      { lastCredentialsRefreshedAt: EXPIRED_CREDENTIALS_AT },
    );

    gmail.use(declinedGoogleTokenRefresh());

    await runSyncCron(CalendarEventListFetchCronJob);

    const channelState = await queryCalendarChannel(revokedChannel);

    expect(channelState.syncStatus).toBe(
      CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(channelState.syncStage).toBe(CalendarChannelSyncStage.FAILED);

    const account = await queryConnectedAccount(
      revokedChannel.connectedAccountId,
    );

    expect(account.authFailedAt).not.toBeNull();
  }, 60000);

  it('relaunches the unknown-failure channel and leaves the permissions-failure channel untouched', async () => {
    await runSyncCron(CalendarRelaunchFailedCalendarChannelsCronJob);

    const relaunchedChannel = await queryCalendarChannel(throttledChannel);

    expect(relaunchedChannel.syncStatus).toBe(
      CalendarChannelSyncStatus.ACTIVE,
    );
    expect(relaunchedChannel.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    );
    expect(relaunchedChannel.throttleFailureCount).toBe(0);
    expect(relaunchedChannel.syncStageStartedAt).toBeNull();

    const untouchedChannel = await queryCalendarChannel(revokedChannel);

    expect(untouchedChannel.syncStatus).toBe(
      CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(untouchedChannel.syncStage).toBe(CalendarChannelSyncStage.FAILED);
  }, 60000);
});
