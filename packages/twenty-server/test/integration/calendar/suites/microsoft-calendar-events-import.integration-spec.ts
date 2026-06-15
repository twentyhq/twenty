import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarEventListFetchCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-event-list-fetch.cron.job';
import { CalendarEventsImportCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-events-import.cron.job';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  microsoftCalendarEvent,
  microsoftCalendarEventsHandlers,
} from 'test/integration/messaging/utils/microsoft-calendar-mock.util';
import { setupMicrosoftMock } from 'test/integration/messaging/utils/microsoft-message-mock.util';
import { queryCalendarChannels } from 'test/integration/messaging/utils/query-messaging.util';
import { enqueueJob } from 'test/integration/utils/enqueue-job.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

const HANDLE = 'microsoft-calendar-events-import@apple.dev';

const findImportedEventTitles = async (titles: string[]): Promise<string[]> => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      objectMetadataPluralName: 'calendarEvents',
      gqlFields: `id
        title`,
      filter: { title: { in: titles } },
    }),
  );

  return response.body.data.calendarEvents.edges.map(
    (edge: { node: { title: string } }) => edge.node.title,
  );
};

describe('Microsoft calendar events import (integration)', () => {
  const microsoft = setupMicrosoftMock({ inbox: [], handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel.cleanup();
  });

  it('imports calendar events through the real delta-fetch and import pipeline', async () => {
    await pollUntil(
      () => queryCalendarChannels(channel.connectedAccountId),
      ([calendarChannel]) =>
        calendarChannel?.syncStage ===
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    );

    const eventId = `microsoft-calendar-event-${randomUUID()}`;
    const eventTitle = `Calendar event ${randomUUID()}`;

    microsoft.use(
      ...microsoftCalendarEventsHandlers([
        microsoftCalendarEvent({ id: eventId, subject: eventTitle }),
      ]),
    );

    await enqueueJob(MessageQueue.cronQueue, CalendarEventListFetchCronJob, {});

    await pollUntil(
      () => queryCalendarChannels(channel.connectedAccountId),
      ([calendarChannel]) =>
        calendarChannel?.syncStage ===
        CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );

    await enqueueJob(MessageQueue.cronQueue, CalendarEventsImportCronJob, {});

    const importedTitles = await pollUntil(
      () => findImportedEventTitles([eventTitle]),
      (titles) => titles.length === 1,
    );

    expect(importedTitles).toEqual([eventTitle]);
  }, 60000);

  it('imports a newly created event through the delta-token continuation', async () => {
    await pollUntil(
      () => queryCalendarChannels(channel.connectedAccountId),
      ([calendarChannel]) =>
        calendarChannel?.syncStage ===
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    );

    const newEventId = `microsoft-calendar-event-${randomUUID()}`;
    const newEventTitle = `Calendar event ${randomUUID()}`;

    microsoft.use(
      ...microsoftCalendarEventsHandlers(
        [microsoftCalendarEvent({ id: newEventId, subject: newEventTitle })],
        { deltaToken: 'mock-calendar-delta-token-2' },
      ),
    );

    await enqueueJob(MessageQueue.cronQueue, CalendarEventListFetchCronJob, {});

    await pollUntil(
      () => queryCalendarChannels(channel.connectedAccountId),
      ([calendarChannel]) =>
        calendarChannel?.syncStage ===
        CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );

    await enqueueJob(MessageQueue.cronQueue, CalendarEventsImportCronJob, {});

    const importedTitles = await pollUntil(
      () => findImportedEventTitles([newEventTitle]),
      (titles) => titles.length === 1,
    );

    expect(importedTitles).toEqual([newEventTitle]);
  }, 60000);
});
