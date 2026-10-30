import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'google-calendar-event-sharing@apple.dev';
const OTHER_HANDLE = 'google-calendar-event-sharing-other@apple.dev';

const syncToken = () => `event-sharing-sync-token-${randomUUID()}`;

const runCalendarSync = async (calendarChannelId: string): Promise<void> => {
  await runCalendarChannelListFetch(calendarChannelId);
  await runCalendarChannelEventsImport(calendarChannelId);
};

const findAssociations = async (eventExternalIds: string[]) =>
  findRecordNodesByFilter<{
    calendarEventId: string;
    calendarChannelId: string;
  }>(
    'calendarChannelEventAssociation',
    'calendarChannelEventAssociations',
    'calendarEventId calendarChannelId',
    { eventExternalId: { in: eventExternalIds } },
  );

const findAssociationChannelIds = async (
  eventExternalIds: string[],
): Promise<string[]> =>
  (await findAssociations(eventExternalIds))
    .map(({ calendarChannelId }) => calendarChannelId)
    .sort();

const findCalendarEventIds = async (
  eventExternalIds: string[],
): Promise<string[]> => [
  ...new Set(
    (await findAssociations(eventExternalIds)).map(
      ({ calendarEventId }) => calendarEventId,
    ),
  ),
];

const findParticipantResponseStatusByHandle = async (
  calendarEventId: string,
): Promise<Record<string, string>> => {
  const participants = await findRecordNodesByFilter<{
    handle: string;
    responseStatus: string;
  }>(
    'calendarEventParticipant',
    'calendarEventParticipants',
    'handle responseStatus',
    { calendarEventId: { eq: calendarEventId } },
  );

  return Object.fromEntries(
    participants.map(({ handle, responseStatus }) => [handle, responseStatus]),
  );
};

const attendee = (email: string, responseStatus = 'accepted') => ({
  email,
  responseStatus,
});

describe('Google calendar event sharing (integration)', () => {
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

  it('stores a meeting synced by two calendars once', async () => {
    const sharedExternalId = `google-calendar-event-${randomUUID()}`;
    const sharedTitle = `Shared meeting ${randomUUID()}`;

    google.serveCalendarEvents(
      [googleCalendarEvent({ id: sharedExternalId, summary: sharedTitle })],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);
    await runCalendarSync(otherChannel.calendarChannelId);

    expect(await findAssociationChannelIds([sharedExternalId])).toEqual(
      [channel.calendarChannelId, otherChannel.calendarChannelId].sort(),
    );
    expect(await findCalendarEventIds([sharedExternalId])).toHaveLength(1);
    expect(await findImportedCalendarEventTitles([sharedTitle])).toEqual([
      sharedTitle,
    ]);
  }, 120000);

  it('never lets a guest copy change the fields or another attendee answer while the organizer copy syncs', async () => {
    const sharedExternalId = `google-calendar-event-${randomUUID()}`;
    const guestHandle = `guest-${randomUUID()}@example.com`;
    const organizer = { email: OTHER_HANDLE };
    const organizerTitle = `Organizer title ${randomUUID()}`;
    const guestTitle = `Guest title ${randomUUID()}`;

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          summary: organizerTitle,
          organizer,
          attendees: [attendee(HANDLE), attendee(guestHandle)],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          summary: guestTitle,
          organizer,
          attendees: [
            attendee(HANDLE, 'tentative'),
            attendee(guestHandle, 'declined'),
          ],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    const [calendarEventId] = await findCalendarEventIds([sharedExternalId]);

    expect(
      await findImportedCalendarEventTitles([organizerTitle, guestTitle]),
    ).toEqual([organizerTitle]);
    expect(
      await findParticipantResponseStatusByHandle(calendarEventId),
    ).toEqual({
      [HANDLE]: 'TENTATIVE',
      [guestHandle]: 'ACCEPTED',
    });
  }, 120000);
});
