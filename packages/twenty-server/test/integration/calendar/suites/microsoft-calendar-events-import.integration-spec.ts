import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  microsoftCalendarEvent,
  microsoftCalendarEventsHandlers,
} from 'test/integration/messaging/utils/microsoft-calendar-mock.util';
import { setupMicrosoftMock } from 'test/integration/messaging/utils/microsoft-message-mock.util';
import { queryCalendarChannels } from 'test/integration/messaging/utils/query-messaging.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import {
  runCalendarChannelEventsImport,
  runCalendarChannelListFetch,
} from 'test/integration/utils/run-channel-sync.util';

const HANDLE = 'microsoft-calendar-events-import@apple.dev';

const findImportedEventTitles = async (titles: string[]): Promise<string[]> => {
  const events = await findRecordNodesByFilter<{ title: string }>(
    'calendarEvent',
    'calendarEvents',
    'title',
    { title: { in: titles } },
  );

  return events.map((event) => event.title);
};

describe('Microsoft calendar events import (integration)', () => {
  const microsoft = setupMicrosoftMock({ inbox: [], handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const importEventAndFindTitle = async (eventTitle: string) => {
    await runCalendarChannelListFetch(channel.calendarChannelId);

    const [calendarChannel] = await queryCalendarChannels(
      channel.connectedAccountId,
    );

    expect(calendarChannel.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );

    await runCalendarChannelEventsImport(channel.calendarChannelId);

    return findImportedEventTitles([eventTitle]);
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('imports calendar events through the real delta-fetch and import pipeline', async () => {
    const eventId = `microsoft-calendar-event-${randomUUID()}`;
    const eventTitle = `Calendar event ${randomUUID()}`;

    microsoft.use(
      ...microsoftCalendarEventsHandlers([
        microsoftCalendarEvent({ id: eventId, subject: eventTitle }),
      ]),
    );

    expect(await importEventAndFindTitle(eventTitle)).toEqual([eventTitle]);
  }, 60000);

  it('imports a newly created event through the delta-token continuation', async () => {
    const newEventId = `microsoft-calendar-event-${randomUUID()}`;
    const newEventTitle = `Calendar event ${randomUUID()}`;

    microsoft.use(
      ...microsoftCalendarEventsHandlers(
        [microsoftCalendarEvent({ id: newEventId, subject: newEventTitle })],
        { deltaToken: 'mock-calendar-delta-token-2' },
      ),
    );

    expect(await importEventAndFindTitle(newEventTitle)).toEqual([
      newEventTitle,
    ]);
  }, 60000);
});
