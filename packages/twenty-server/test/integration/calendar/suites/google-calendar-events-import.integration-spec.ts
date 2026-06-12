import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarEventListFetchCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-event-list-fetch.cron.job';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import { setupGmailMock } from 'test/integration/messaging/utils/gmail-message-mock.util';
import {
  googleCalendarEvent,
  googleCalendarEventsHandler,
} from 'test/integration/messaging/utils/google-calendar-mock.util';
import { queryCalendarChannels } from 'test/integration/messaging/utils/query-messaging.util';
import { enqueueJob } from 'test/integration/utils/enqueue-job.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

const HANDLE = 'google-calendar-events-import@apple.dev';

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

describe('Google calendar events import (integration)', () => {
  const gmail = setupGmailMock({ inbox: [], handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel.cleanup();
  });

  it('imports calendar events through the real list-fetch pipeline', async () => {
    await pollUntil(
      () => queryCalendarChannels(channel.connectedAccountId),
      ([calendarChannel]) =>
        calendarChannel?.syncStage ===
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    );

    const eventTitle = `Calendar event ${randomUUID()}`;

    gmail.use(
      googleCalendarEventsHandler([
        googleCalendarEvent({ summary: eventTitle }),
      ]),
    );

    await enqueueJob(MessageQueue.cronQueue, CalendarEventListFetchCronJob, {});

    const importedTitles = await pollUntil(
      () => findImportedEventTitles([eventTitle]),
      (titles) => titles.length === 1,
    );

    expect(importedTitles).toEqual([eventTitle]);
  }, 60000);

  it('imports a newly created event through the sync-token incremental fetch', async () => {
    await pollUntil(
      () => queryCalendarChannels(channel.connectedAccountId),
      ([calendarChannel]) =>
        calendarChannel?.syncStage ===
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    );

    const newEventTitle = `Calendar event ${randomUUID()}`;

    gmail.use(
      googleCalendarEventsHandler(
        [googleCalendarEvent({ summary: newEventTitle })],
        { nextSyncToken: 'mock-calendar-sync-token-2' },
      ),
    );

    await enqueueJob(MessageQueue.cronQueue, CalendarEventListFetchCronJob, {});

    const importedTitles = await pollUntil(
      () => findImportedEventTitles([newEventTitle]),
      (titles) => titles.length === 1,
    );

    expect(importedTitles).toEqual([newEventTitle]);
  }, 60000);
});
