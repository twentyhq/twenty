import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { microsoftCalendarEvent } from 'test/integration/microsoft/mocks/microsoft-calendar-event.util';
import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { queryCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'microsoft-calendar-events-import@apple.dev';
const OTHER_HANDLE = 'microsoft-calendar-events-import-other@apple.dev';

describe('Microsoft calendar events import (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

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
    const eventTitle = `Calendar event ${randomUUID()}`;

    microsoft.serveCalendarEvents([
      microsoftCalendarEvent({ subject: eventTitle }),
    ]);

    await runCalendarChannelListFetch(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );

    await runCalendarChannelEventsImport(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([
      eventTitle,
    ]);
  }, 60000);

  it('imports a newly created event through the delta-token continuation', async () => {
    const newEventTitle = `Calendar event ${randomUUID()}`;

    microsoft.serveCalendarEvents(
      [microsoftCalendarEvent({ subject: newEventTitle })],
      { deltaToken: 'mock-calendar-delta-token-2' },
    );

    await runCalendarChannelListFetch(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );

    await runCalendarChannelEventsImport(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([newEventTitle])).toEqual([
      newEventTitle,
    ]);
  }, 60000);

  it('stores a meeting synced by two mailboxes once, matched on its iCalUid', async () => {
    const iCalUId = `meeting-${randomUUID()}`;
    const eventId = `microsoft-calendar-event-${randomUUID()}`;
    const otherEventId = `microsoft-calendar-event-${randomUUID()}`;

    microsoft.serveCalendarEvents(
      [microsoftCalendarEvent({ id: eventId, iCalUId })],
      { deltaToken: `mock-calendar-delta-token-${randomUUID()}` },
    );

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);

    microsoft.actAsAccount(OTHER_HANDLE);

    const otherChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: OTHER_HANDLE,
    });

    try {
      microsoft.serveCalendarEvents(
        [microsoftCalendarEvent({ id: otherEventId, iCalUId })],
        { deltaToken: `mock-calendar-delta-token-${randomUUID()}` },
      );

      await runCalendarChannelListFetch(otherChannel.calendarChannelId);
      await runCalendarChannelEventsImport(otherChannel.calendarChannelId);

      const associations = await findRecordNodesByFilter<{
        calendarEventId: string;
      }>(
        'calendarChannelEventAssociation',
        'calendarChannelEventAssociations',
        'calendarEventId',
        { eventExternalId: { in: [eventId, otherEventId] } },
      );

      expect(associations).toHaveLength(2);
      expect(
        new Set(associations.map(({ calendarEventId }) => calendarEventId))
          .size,
      ).toBe(1);
    } finally {
      microsoft.actAsAccount(HANDLE);
      await otherChannel.cleanup().catch(() => undefined);
    }
  }, 120000);
});
