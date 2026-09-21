import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findCalendarEventAssociationChannelIds } from 'test/integration/utils/find-calendar-event-association-channel-ids.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'google-calendar-orphan-cleanup@apple.dev';
const OTHER_HANDLE = 'google-calendar-orphan-cleanup-other@apple.dev';

const syncToken = () => `orphan-cleanup-sync-token-${randomUUID()}`;

const runCalendarSync = async (calendarChannelId: string): Promise<void> => {
  await runCalendarChannelListFetch(calendarChannelId);
  await runCalendarChannelEventsImport(calendarChannelId);
};

describe('Google calendar orphan cleanup (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let otherChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    google.actAsAccount(OTHER_HANDLE);

    otherChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: OTHER_HANDLE,
    });

    google.actAsAccount(HANDLE);
  }, 120000);

  afterAll(async () => {
    await otherChannel?.cleanup().catch(() => undefined);
    await channel?.cleanup().catch(() => undefined);
  });

  it('deletes the calendar event once its last association is removed', async () => {
    const eventExternalId = `google-calendar-event-${randomUUID()}`;
    const eventTitle = `Orphan probe ${randomUUID()}`;

    google.serveCalendarEvents(
      [googleCalendarEvent({ id: eventExternalId, summary: eventTitle })],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([
      eventTitle,
    ]);
    expect(
      await findCalendarEventAssociationChannelIds(eventExternalId),
    ).toEqual([channel.calendarChannelId]);

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: eventExternalId,
          summary: eventTitle,
          status: 'cancelled',
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    expect(
      await findCalendarEventAssociationChannelIds(eventExternalId),
    ).toEqual([]);
    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([]);
  }, 60000);

  it('keeps the events of the same channel that were not cancelled', async () => {
    const cancelledExternalId = `google-calendar-event-${randomUUID()}`;
    const cancelledTitle = `Orphan probe cancelled ${randomUUID()}`;
    const survivingTitle = `Orphan probe surviving ${randomUUID()}`;

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: cancelledExternalId,
          summary: cancelledTitle,
        }),
        googleCalendarEvent({ summary: survivingTitle }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    expect(
      await findImportedCalendarEventTitles([cancelledTitle, survivingTitle]),
    ).toEqual([cancelledTitle, survivingTitle].sort());

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: cancelledExternalId,
          summary: cancelledTitle,
          status: 'cancelled',
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([cancelledTitle])).toEqual([]);
    expect(await findImportedCalendarEventTitles([survivingTitle])).toEqual([
      survivingTitle,
    ]);
  }, 60000);

  it('keeps another channel copy of the same external event', async () => {
    const sharedExternalId = `google-calendar-event-${randomUUID()}`;
    const sharedTitle = `Orphan probe shared ${randomUUID()}`;

    google.serveCalendarEvents(
      [googleCalendarEvent({ id: sharedExternalId, summary: sharedTitle })],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);
    await runCalendarSync(otherChannel.calendarChannelId);

    expect(
      await findCalendarEventAssociationChannelIds(sharedExternalId),
    ).toEqual(
      [channel.calendarChannelId, otherChannel.calendarChannelId].sort(),
    );

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          summary: sharedTitle,
          status: 'cancelled',
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    expect(
      await findCalendarEventAssociationChannelIds(sharedExternalId),
    ).toEqual([otherChannel.calendarChannelId]);
    expect(await findImportedCalendarEventTitles([sharedTitle])).toEqual([
      sharedTitle,
    ]);
  }, 120000);

  it('keeps previously imported events when the delta has no deletions', async () => {
    const existingTitle = `Orphan probe existing ${randomUUID()}`;
    const addedTitle = `Orphan probe added ${randomUUID()}`;

    google.serveCalendarEvents(
      [googleCalendarEvent({ summary: existingTitle })],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    google.serveCalendarEvents([googleCalendarEvent({ summary: addedTitle })], {
      nextSyncToken: syncToken(),
    });

    await runCalendarSync(channel.calendarChannelId);

    expect(
      await findImportedCalendarEventTitles([existingTitle, addedTitle]),
    ).toEqual([existingTitle, addedTitle].sort());
  }, 60000);
});
