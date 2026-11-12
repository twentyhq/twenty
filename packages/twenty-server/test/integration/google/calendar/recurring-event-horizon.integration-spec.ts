import { randomUUID } from 'node:crypto';

import { type calendar_v3 } from 'googleapis';
import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  FeatureFlagKey,
} from 'twenty-shared/types';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { enqueueJobAndDrain } from 'test/integration/utils/enqueue-job-and-drain.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { removePendingWakeUpJobs } from 'test/integration/utils/remove-pending-wake-up-jobs.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { scheduleChannelStage } from 'test/integration/utils/schedule-channel-stage.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { RESUME_PENDING_WAKE_UP_JOB_NAME } from 'src/engine/core-modules/pending-wake-up/constants/resume-pending-wake-up-job-name.constant';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CALENDAR_RECURRING_EVENT_HORIZON_MS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-recurring-event-horizon-ms.constant';
import { CALENDAR_RECURRING_EVENT_WAKE_UP_OWNER_TYPE } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-recurring-event-wake-up-owner-type.constant';
import { getGoogleCalendarEventStartTime } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/get-google-calendar-event-start-time.util';
import { CalendarEventListFetchJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';

const HANDLE = 'google-calendar-recurring-events@apple.dev';
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

type CalendarRecurringEventWakeUp = {
  id: string;
  ownerKey: string;
  resumeAt: Date;
};

const buildRecurringEventInstance = ({
  recurringEventId,
  daysFromNow,
  isAllDay = false,
}: {
  recurringEventId: string;
  daysFromNow: number;
  isAllDay?: boolean;
}): calendar_v3.Schema$Event => {
  const startTime = new Date(Date.now() + daysFromNow * DAY_MS);
  const endTime = new Date(startTime.getTime() + (isAllDay ? DAY_MS : HOUR_MS));

  return googleCalendarEvent({
    id: `${recurringEventId}_${daysFromNow}`,
    recurringEventId,
    summary: `${recurringEventId} in ${daysFromNow} days`,
    start: isAllDay
      ? { date: startTime.toISOString().slice(0, 10) }
      : { dateTime: startTime.toISOString() },
    end: isAllDay
      ? { date: endTime.toISOString().slice(0, 10) }
      : { dateTime: endTime.toISOString() },
  });
};

const getSortedEventTitles = (events: calendar_v3.Schema$Event[]) =>
  events.map(({ summary }) => summary ?? '').sort();

const getExpectedWakeUpTime = (
  earliestInstanceBeyondHorizon: calendar_v3.Schema$Event,
) =>
  new Date(
    getGoogleCalendarEventStartTime(earliestInstanceBeyondHorizon) -
      CALENDAR_RECURRING_EVENT_HORIZON_MS,
  );

describe('Google calendar recurring event horizon (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let workspaceId: string;

  const setRecurringEventHorizonEnabled = (value: boolean) =>
    updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CALENDAR_RECURRING_EVENT_HORIZON_ENABLED,
      value,
      expectToFail: false,
    });

  const findRecurringEventWakeUps = (): Promise<
    CalendarRecurringEventWakeUp[]
  > =>
    global.testDataSource.query(
      `SELECT id, "ownerKey", "resumeAt" FROM core."pendingWakeUp" WHERE "ownerType" = $1 AND "ownerId" = $2`,
      [CALENDAR_RECURRING_EVENT_WAKE_UP_OWNER_TYPE, channel.calendarChannelId],
    );

  const removeRecurringEventWakeUpJobs = async () =>
    removePendingWakeUpJobs({
      wakeUpIds: (await findRecurringEventWakeUps()).map(({ id }) => id),
    });

  const runFullCalendarSync = async (events: calendar_v3.Schema$Event[]) => {
    google.serveCalendarEvents(events, {
      nextSyncToken: `sync-token-${randomUUID()}`,
    });

    await resetCalendarChannelSyncState(channel.calendarChannelId, '');
    await scheduleChannelStage(
      CalendarChannelEntity,
      channel.calendarChannelId,
      CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
    );

    await global.app
      .get<MessageQueueService>(getQueueToken(MessageQueue.calendarQueue), {
        strict: false,
      })
      .add(
        CalendarEventListFetchJob.name,
        { workspaceId, calendarChannelId: channel.calendarChannelId },
        { workspaceId, isWorkspaceJob: true },
      );

    await expectEventually(async () => {
      const { syncStage } = await getCoreRepository<CalendarChannelEntity>(
        CalendarChannelEntity,
      ).findOneByOrFail({ id: channel.calendarChannelId });

      expect([
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
      ]).not.toContain(syncStage);

      for (const { resumeAt } of await findRecurringEventWakeUps()) {
        expect(resumeAt.getTime()).toBeGreaterThan(Date.now());
      }
    });

    await removeRecurringEventWakeUpJobs();
    await waitForAllJobsToFinish();

    await runCalendarChannelEventsImport(channel.calendarChannelId);
  };

  const runRecurringEventWakeUp = (wakeUpId: string) =>
    enqueueJobAndDrain({
      queue: MessageQueue.delayedJobsQueue,
      jobName: RESUME_PENDING_WAKE_UP_JOB_NAME,
      data: { workspaceId, wakeUpId },
      scope: { workspaceId, isWorkspaceJob: true },
    });

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    ({ workspaceId } = await getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).findOneByOrFail({ id: channel.calendarChannelId }));
  }, 60000);

  afterEach(async () => {
    await removeRecurringEventWakeUpJobs();
    await global.testDataSource.query(
      `DELETE FROM core."pendingWakeUp" WHERE "ownerType" = $1 AND "ownerId" = $2`,
      [CALENDAR_RECURRING_EVENT_WAKE_UP_OWNER_TYPE, channel.calendarChannelId],
    );
  });

  afterAll(async () => {
    await setRecurringEventHorizonEnabled(false);
    await channel?.cleanup().catch(() => undefined);
  });

  it('imports every instance while the flag is off and removes the ones beyond 90 days once it is on', async () => {
    await setRecurringEventHorizonEnabled(false);

    const recurringEventId = `series-${randomUUID()}`;
    const instanceWithinHorizon = buildRecurringEventInstance({
      recurringEventId,
      daysFromNow: 10,
    });
    const instanceBeyondHorizon = buildRecurringEventInstance({
      recurringEventId,
      daysFromNow: 100,
    });
    const singleEventBeyondHorizon = googleCalendarEvent({
      summary: `Single event ${randomUUID()}`,
      start: { dateTime: new Date(Date.now() + 200 * DAY_MS).toISOString() },
      end: { dateTime: new Date(Date.now() + 201 * DAY_MS).toISOString() },
    });
    const events = [
      instanceWithinHorizon,
      instanceBeyondHorizon,
      singleEventBeyondHorizon,
    ];

    await runFullCalendarSync(events);

    expect(
      await findImportedCalendarEventTitles(getSortedEventTitles(events)),
    ).toEqual(getSortedEventTitles(events));
    expect(await findRecurringEventWakeUps()).toEqual([]);

    await setRecurringEventHorizonEnabled(true);
    google.serveRecurringEventInstances(recurringEventId, [
      instanceWithinHorizon,
      instanceBeyondHorizon,
    ]);

    await runFullCalendarSync(events);

    expect(
      await findImportedCalendarEventTitles(getSortedEventTitles(events)),
    ).toEqual(
      getSortedEventTitles([instanceWithinHorizon, singleEventBeyondHorizon]),
    );
  }, 120000);

  it('schedules one wake-up per recurring event at its earliest instance beyond 90 days, in whatever order Google lists them', async () => {
    await setRecurringEventHorizonEnabled(true);

    const weeklyEventId = `series-${randomUUID()}`;
    const [
      instanceInHundredThirtyDays,
      instanceInTenDays,
      instanceInHundredDays,
    ] = [130, 10, 100].map((daysFromNow) =>
      buildRecurringEventInstance({
        recurringEventId: weeklyEventId,
        daysFromNow,
      }),
    );
    const weeklyEventInstances = [
      instanceInHundredThirtyDays,
      instanceInTenDays,
      instanceInHundredDays,
    ];
    const allDayEventId = `series-${randomUUID()}`;
    const allDayEventInstance = buildRecurringEventInstance({
      recurringEventId: allDayEventId,
      daysFromNow: 95,
      isAllDay: true,
    });

    google.serveRecurringEventInstances(weeklyEventId, weeklyEventInstances);
    google.serveRecurringEventInstances(allDayEventId, [allDayEventInstance]);

    await runFullCalendarSync([...weeklyEventInstances, allDayEventInstance]);

    expect(
      await findImportedCalendarEventTitles(
        getSortedEventTitles([...weeklyEventInstances, allDayEventInstance]),
      ),
    ).toEqual(getSortedEventTitles([instanceInTenDays]));

    const recurringEventWakeUps = await findRecurringEventWakeUps();

    expect(recurringEventWakeUps).toHaveLength(2);
    expect(recurringEventWakeUps).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          ownerKey: weeklyEventId,
          resumeAt: getExpectedWakeUpTime(instanceInHundredDays),
        },
        {
          id: expect.any(String),
          ownerKey: allDayEventId,
          resumeAt: getExpectedWakeUpTime(allDayEventInstance),
        },
      ]),
    );
  }, 120000);

  it('imports the instances within 90 days that the sync did not bring', async () => {
    await setRecurringEventHorizonEnabled(true);

    const recurringEventId = `series-${randomUUID()}`;
    const [
      instanceInTenDays,
      instanceInTwentyDays,
      instanceInFortyFiveDays,
      instanceInHundredDays,
    ] = [10, 20, 45, 100].map((daysFromNow) =>
      buildRecurringEventInstance({ recurringEventId, daysFromNow }),
    );
    const allInstances = [
      instanceInTenDays,
      instanceInTwentyDays,
      instanceInFortyFiveDays,
      instanceInHundredDays,
    ];

    google.serveRecurringEventInstances(recurringEventId, allInstances);

    await runFullCalendarSync([instanceInTenDays, instanceInHundredDays]);

    expect(
      await findImportedCalendarEventTitles(getSortedEventTitles(allInstances)),
    ).toEqual(
      getSortedEventTitles([
        instanceInTenDays,
        instanceInTwentyDays,
        instanceInFortyFiveDays,
      ]),
    );
    expect(await findRecurringEventWakeUps()).toEqual([
      {
        id: expect.any(String),
        ownerKey: recurringEventId,
        resumeAt: getExpectedWakeUpTime(instanceInHundredDays),
      },
    ]);
  }, 120000);

  it.each<{
    title: string;
    makeWakeUpObsolete: (recurringEvent: {
      recurringEventId: string;
      instanceWithinHorizon: calendar_v3.Schema$Event;
    }) => Promise<unknown> | void;
  }>([
    {
      title: 'once the recurring event has no instance left beyond 90 days',
      makeWakeUpObsolete: ({ recurringEventId, instanceWithinHorizon }) =>
        google.serveRecurringEventInstances(recurringEventId, [
          instanceWithinHorizon,
        ]),
    },
    {
      title: 'once the recurring event is deleted',
      makeWakeUpObsolete: ({ recurringEventId }) =>
        google.failRecurringEventInstances(recurringEventId, {
          status: 404,
          reason: 'notFound',
          message: 'Not Found',
        }),
    },
    {
      title: 'once the flag is turned off',
      makeWakeUpObsolete: () => setRecurringEventHorizonEnabled(false),
    },
  ])(
    'removes the wake-up $title',
    async ({ makeWakeUpObsolete }) => {
      await setRecurringEventHorizonEnabled(true);

      const recurringEventId = `series-${randomUUID()}`;
      const instanceWithinHorizon = buildRecurringEventInstance({
        recurringEventId,
        daysFromNow: 10,
      });
      const instanceBeyondHorizon = buildRecurringEventInstance({
        recurringEventId,
        daysFromNow: 100,
      });

      google.serveRecurringEventInstances(recurringEventId, [
        instanceWithinHorizon,
        instanceBeyondHorizon,
      ]);

      await runFullCalendarSync([instanceWithinHorizon, instanceBeyondHorizon]);

      const [recurringEventWakeUp] = await findRecurringEventWakeUps();

      await makeWakeUpObsolete({ recurringEventId, instanceWithinHorizon });
      await runRecurringEventWakeUp(recurringEventWakeUp.id);

      expect(await findRecurringEventWakeUps()).toEqual([]);
    },
    120000,
  );
});
