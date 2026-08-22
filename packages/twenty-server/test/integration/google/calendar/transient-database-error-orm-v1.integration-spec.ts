import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
  FeatureFlagKey,
} from 'twenty-shared/types';

import { TRANSIENT_POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/transient-postgres-error-codes.constants';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { queryCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'calendar-transient-database-error-orm-v1@apple.dev';

const raiseSqlState = (sqlState: string): string =>
  `DO $$ BEGIN RAISE EXCEPTION 'simulated database failure' USING ERRCODE = '${sqlState}'; END $$;`;

describe('Calendar import transient database errors on the ORM v1 path (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let calendarEventParticipantService: CalendarEventParticipantService;

  const fetchOneEvent = async (): Promise<void> => {
    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: `google-calendar-event-${randomUUID()}`,
          summary: `Calendar event ${randomUUID()}`,
          attendees: [{ email: `attendee-${randomUUID()}@acme.com` }],
        }),
      ],
      { nextSyncToken: `sync-token-${randomUUID()}` },
    );

    await resetCalendarChannelSyncState(channel.calendarChannelId, '');
    await runCalendarChannelListFetch(channel.calendarChannelId);
  };

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
      value: false,
      expectToFail: false,
    });

    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    calendarEventParticipantService =
      getAppProviderByClassName<CalendarEventParticipantService>(
        'CalendarEventParticipantService',
      );
  }, 120000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
      value: true,
      expectToFail: false,
    });
  }, 60000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(TRANSIENT_POSTGRESQL_ERROR_CODES)(
    'should reschedule the calendar channel when the import transaction fails with sqlstate %s',
    async (sqlState) => {
      await fetchOneEvent();

      jest
        .spyOn(
          calendarEventParticipantService,
          'writeCalendarEventParticipants',
        )
        .mockImplementation(async ({ transactionScope }) => {
          await transactionScope.executeRawQuery(raiseSqlState(sqlState));
        });

      await runCalendarChannelEventsImport(channel.calendarChannelId);

      const channelState = await queryCalendarChannel(channel);

      expect(channelState.throttleFailureCount).toBe(1);
      expect(channelState.syncStage).toBe(
        CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
      );
      expect(channelState.syncStatus).toBe(CalendarChannelSyncStatus.ONGOING);
    },
    120000,
  );

  it('should keep the original transient failure when the rollback fails on the same dead connection', async () => {
    await fetchOneEvent();

    jest
      .spyOn(calendarEventParticipantService, 'writeCalendarEventParticipants')
      .mockImplementation(async ({ transactionScope }) => {
        await transactionScope.executeRawQuery(
          'SELECT pg_terminate_backend(pg_backend_pid())',
        );
      });

    await runCalendarChannelEventsImport(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.throttleFailureCount).toBe(1);
    expect(channelState.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );
    expect(channelState.syncStatus).toBe(CalendarChannelSyncStatus.ONGOING);
  }, 120000);

  it('should fail the calendar channel as unknown when a non-transient sqlstate aborts the import transaction', async () => {
    await fetchOneEvent();

    jest
      .spyOn(calendarEventParticipantService, 'writeCalendarEventParticipants')
      .mockImplementation(async ({ transactionScope }) => {
        await transactionScope.executeRawQuery(raiseSqlState('23505'));
      });

    await runCalendarChannelEventsImport(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStage).toBe(CalendarChannelSyncStage.FAILED);
    expect(channelState.throttleFailureCount).toBe(0);
  }, 120000);
});
