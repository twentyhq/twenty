import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import {
  findCreatedPeopleEmails,
  findImportedCalendarEventTitles,
} from 'test/integration/utils/find-imported-records.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { updateCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import { runCalendarChannelWebhookSync } from 'test/integration/utils/run-calendar-channel-webhook-sync.util';

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

const findParticipantHandles = async (
  calendarEventId: string,
): Promise<string[]> => {
  const participants = await findRecordNodesByFilter<{ handle: string }>(
    'calendarEventParticipant',
    'calendarEventParticipants',
    'handle',
    { calendarEventId: { eq: calendarEventId } },
  );

  return participants.map(({ handle }) => handle).sort();
};

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

  it('links a meeting that arrives through a webhook to the copy another calendar stored', async () => {
    const sharedExternalId = `google-calendar-event-${randomUUID()}`;

    google.serveCalendarEvents(
      [googleCalendarEvent({ id: sharedExternalId })],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);
    await runCalendarChannelWebhookSync(otherChannel.calendarChannelId);

    expect(await findAssociationChannelIds([sharedExternalId])).toEqual(
      [channel.calendarChannelId, otherChannel.calendarChannelId].sort(),
    );
    expect(await findCalendarEventIds([sharedExternalId])).toHaveLength(1);
  }, 120000);

  it('drops an attendee that the only copy no longer lists', async () => {
    const externalId = `google-calendar-event-${randomUUID()}`;
    const removedGuestHandle = `removed-guest-${randomUUID()}@example.com`;

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: externalId,
          attendees: [attendee(HANDLE), attendee(removedGuestHandle)],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    google.serveCalendarEvents(
      [googleCalendarEvent({ id: externalId, attendees: [attendee(HANDLE)] })],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    const [calendarEventId] = await findCalendarEventIds([externalId]);

    expect(await findParticipantHandles(calendarEventId)).toEqual([HANDLE]);
  }, 120000);

  it('keeps the attendees that a guest copy does not list', async () => {
    const sharedExternalId = `google-calendar-event-${randomUUID()}`;
    const guestHandle = `guest-${randomUUID()}@example.com`;

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          attendees: [attendee(HANDLE), attendee(guestHandle)],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          attendees: [attendee(OTHER_HANDLE)],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    const [calendarEventId] = await findCalendarEventIds([sharedExternalId]);

    expect(await findParticipantHandles(calendarEventId)).toEqual(
      [HANDLE, OTHER_HANDLE, guestHandle].sort(),
    );
  }, 120000);

  it('lets a guest copy change the fields and its own answer but not another attendee answer when the organizer does not sync', async () => {
    const sharedExternalId = `google-calendar-event-${randomUUID()}`;
    const guestHandle = `guest-${randomUUID()}@example.com`;
    const organizer = { email: `organizer-${randomUUID()}@example.com` };
    const firstTitle = `First title ${randomUUID()}`;
    const guestTitle = `Guest title ${randomUUID()}`;

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          summary: firstTitle,
          organizer,
          attendees: [
            attendee(HANDLE),
            attendee(OTHER_HANDLE, 'needsAction'),
            attendee(guestHandle),
          ],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          summary: guestTitle,
          organizer,
          attendees: [
            attendee(HANDLE, 'declined'),
            attendee(OTHER_HANDLE),
            attendee(guestHandle, 'declined'),
          ],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    const [calendarEventId] = await findCalendarEventIds([sharedExternalId]);

    expect(
      await findImportedCalendarEventTitles([firstTitle, guestTitle]),
    ).toEqual([guestTitle]);
    expect(
      await findParticipantResponseStatusByHandle(calendarEventId),
    ).toEqual({
      [HANDLE]: 'ACCEPTED',
      [OTHER_HANDLE]: 'ACCEPTED',
      [guestHandle]: 'ACCEPTED',
    });
  }, 120000);

  it('lets the organizer copy record another attendee answer but keeps the attendees it does not list', async () => {
    const sharedExternalId = `google-calendar-event-${randomUUID()}`;
    const decliningGuestHandle = `declining-guest-${randomUUID()}@example.com`;
    const unlistedGuestHandle = `unlisted-guest-${randomUUID()}@example.com`;
    const organizer = { email: OTHER_HANDLE };

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          organizer,
          attendees: [
            attendee(HANDLE),
            attendee(decliningGuestHandle),
            attendee(unlistedGuestHandle),
          ],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          organizer,
          attendees: [
            attendee(HANDLE),
            attendee(decliningGuestHandle, 'declined'),
          ],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    const [calendarEventId] = await findCalendarEventIds([sharedExternalId]);

    expect(
      await findParticipantResponseStatusByHandle(calendarEventId),
    ).toEqual({
      [HANDLE]: 'ACCEPTED',
      [decliningGuestHandle]: 'DECLINED',
      [unlistedGuestHandle]: 'ACCEPTED',
    });
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

  it('keeps the attendees of a shared event once the flag is turned off', async () => {
    const sharedExternalId = `google-calendar-event-${randomUUID()}`;
    const guestHandle = `guest-${randomUUID()}@example.com`;

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          attendees: [attendee(HANDLE), attendee(guestHandle)],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          attendees: [attendee(OTHER_HANDLE), attendee(guestHandle)],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED,
      value: false,
      expectToFail: false,
    });

    try {
      google.serveCalendarEvents(
        [
          googleCalendarEvent({
            id: sharedExternalId,
            attendees: [attendee(OTHER_HANDLE)],
          }),
        ],
        { nextSyncToken: syncToken() },
      );

      await runCalendarSync(otherChannel.calendarChannelId);
    } finally {
      await updateFeatureFlag({
        featureFlag:
          FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED,
        value: true,
        expectToFail: false,
      });
    }

    const [calendarEventId] = await findCalendarEventIds([sharedExternalId]);

    expect(await findParticipantHandles(calendarEventId)).toEqual(
      [HANDLE, OTHER_HANDLE, guestHandle].sort(),
    );
  }, 120000);

  it('offers the attendees of a linked copy for contact creation even when they were already stored', async () => {
    const sharedExternalId = `google-calendar-event-${randomUUID()}`;
    const guestHandle = `guest-${randomUUID()}@acme.com`;

    await updateCalendarChannel(channel.calendarChannelId, {
      isContactAutoCreationEnabled: false,
    });
    await updateCalendarChannel(otherChannel.calendarChannelId, {
      isContactAutoCreationEnabled: true,
    });

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          attendees: [attendee(HANDLE), attendee(guestHandle)],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    expect(await findCreatedPeopleEmails([guestHandle])).toEqual([]);

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: sharedExternalId,
          attendees: [attendee(OTHER_HANDLE), attendee(guestHandle)],
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    expect(await findCreatedPeopleEmails([guestHandle])).toEqual([guestHandle]);
  }, 120000);

  it('keeps occurrences of the same series apart', async () => {
    const seriesId = `google-calendar-series-${randomUUID()}`;
    const firstOccurrenceId = `${seriesId}_20261012T090000Z`;
    const secondOccurrenceId = `${seriesId}_20261019T090000Z`;

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: firstOccurrenceId,
          iCalUID: `${seriesId}@google.com`,
          recurringEventId: seriesId,
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: secondOccurrenceId,
          iCalUID: `${seriesId}@google.com`,
          recurringEventId: seriesId,
        }),
      ],
      { nextSyncToken: syncToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    const [firstCalendarEventId] = await findCalendarEventIds([
      firstOccurrenceId,
    ]);
    const [secondCalendarEventId] = await findCalendarEventIds([
      secondOccurrenceId,
    ]);

    expect(firstCalendarEventId).not.toBe(secondCalendarEventId);
  }, 120000);
});
