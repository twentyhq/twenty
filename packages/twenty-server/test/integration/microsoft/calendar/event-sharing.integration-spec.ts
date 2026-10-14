import { randomUUID } from 'node:crypto';

import {
  type Attendee,
  type ResponseType,
} from '@microsoft/microsoft-graph-types';
import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';

import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { microsoftCalendarEvent } from 'test/integration/microsoft/mocks/microsoft-calendar-event.util';
import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
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

const HANDLE = 'microsoft-calendar-event-sharing@apple.dev';
const OTHER_HANDLE = 'microsoft-calendar-event-sharing-other@apple.dev';

const deltaToken = () => `event-sharing-delta-token-${randomUUID()}`;

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

const attendee = (
  address: string,
  response: ResponseType = 'accepted',
): Attendee => ({
  emailAddress: { address },
  status: { response },
});

const buildEventIds = () => ({
  iCalUId: `meeting-${randomUUID()}`,
  eventId: `microsoft-calendar-event-${randomUUID()}`,
  otherEventId: `microsoft-calendar-event-${randomUUID()}`,
});

describe('Microsoft calendar event sharing (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let otherChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });

    microsoft.actAsAccount(OTHER_HANDLE);

    otherChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: OTHER_HANDLE,
    });

    microsoft.actAsAccount(HANDLE);
  }, 120000);

  afterAll(async () => {
    await otherChannel?.cleanup().catch(() => undefined);
    await channel?.cleanup().catch(() => undefined);
  });

  it('stores a meeting synced by two calendars once', async () => {
    const { iCalUId, eventId, otherEventId } = buildEventIds();
    const sharedTitle = `Shared meeting ${randomUUID()}`;

    microsoft.serveCalendarEvents(
      [microsoftCalendarEvent({ id: eventId, iCalUId, subject: sharedTitle })],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: otherEventId,
          iCalUId,
          subject: sharedTitle,
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    expect(await findAssociationChannelIds([eventId, otherEventId])).toEqual(
      [channel.calendarChannelId, otherChannel.calendarChannelId].sort(),
    );
    expect(await findCalendarEventIds([eventId, otherEventId])).toHaveLength(1);
    expect(await findImportedCalendarEventTitles([sharedTitle])).toEqual([
      sharedTitle,
    ]);
  }, 120000);

  it('links a meeting that arrives through a webhook to the copy another calendar stored', async () => {
    const { iCalUId, eventId, otherEventId } = buildEventIds();

    microsoft.serveCalendarEvents(
      [microsoftCalendarEvent({ id: eventId, iCalUId })],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    microsoft.serveCalendarEvents(
      [microsoftCalendarEvent({ id: otherEventId, iCalUId })],
      { deltaToken: deltaToken() },
    );

    await runCalendarChannelWebhookSync(otherChannel.calendarChannelId);

    expect(await findAssociationChannelIds([eventId, otherEventId])).toEqual(
      [channel.calendarChannelId, otherChannel.calendarChannelId].sort(),
    );
    expect(await findCalendarEventIds([eventId, otherEventId])).toHaveLength(1);
  }, 120000);

  it('drops an attendee that the only copy no longer lists', async () => {
    const { iCalUId, eventId } = buildEventIds();
    const removedGuestHandle = `removed-guest-${randomUUID()}@example.com`;

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: eventId,
          iCalUId,
          attendees: [attendee(HANDLE), attendee(removedGuestHandle)],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: eventId,
          iCalUId,
          attendees: [attendee(HANDLE)],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    const [calendarEventId] = await findCalendarEventIds([eventId]);

    expect(await findParticipantHandles(calendarEventId)).toEqual([HANDLE]);
  }, 120000);

  it('keeps the attendees that a guest copy does not list', async () => {
    const { iCalUId, eventId, otherEventId } = buildEventIds();
    const guestHandle = `guest-${randomUUID()}@example.com`;

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: eventId,
          iCalUId,
          attendees: [attendee(HANDLE), attendee(guestHandle)],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: otherEventId,
          iCalUId,
          attendees: [attendee(OTHER_HANDLE)],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    const [calendarEventId] = await findCalendarEventIds([
      eventId,
      otherEventId,
    ]);

    expect(await findParticipantHandles(calendarEventId)).toEqual(
      [HANDLE, OTHER_HANDLE, guestHandle].sort(),
    );
  }, 120000);

  it('lets a guest copy change the fields and its own answer but not another attendee answer when the organizer does not sync', async () => {
    const { iCalUId, eventId, otherEventId } = buildEventIds();
    const guestHandle = `guest-${randomUUID()}@example.com`;
    const organizer = {
      emailAddress: { address: `organizer-${randomUUID()}@example.com` },
    };
    const firstTitle = `First title ${randomUUID()}`;
    const guestTitle = `Guest title ${randomUUID()}`;

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: eventId,
          iCalUId,
          subject: firstTitle,
          organizer,
          attendees: [
            attendee(HANDLE),
            attendee(OTHER_HANDLE, 'notResponded'),
            attendee(guestHandle),
          ],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: otherEventId,
          iCalUId,
          subject: guestTitle,
          organizer,
          attendees: [
            attendee(HANDLE, 'declined'),
            attendee(OTHER_HANDLE),
            attendee(guestHandle, 'declined'),
          ],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    const [calendarEventId] = await findCalendarEventIds([
      eventId,
      otherEventId,
    ]);

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
    const { iCalUId, eventId, otherEventId } = buildEventIds();
    const decliningGuestHandle = `declining-guest-${randomUUID()}@example.com`;
    const unlistedGuestHandle = `unlisted-guest-${randomUUID()}@example.com`;
    const organizer = { emailAddress: { address: OTHER_HANDLE } };

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: eventId,
          iCalUId,
          organizer,
          attendees: [
            attendee(HANDLE),
            attendee(decliningGuestHandle),
            attendee(unlistedGuestHandle),
          ],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: otherEventId,
          iCalUId,
          organizer,
          attendees: [
            attendee(HANDLE),
            attendee(decliningGuestHandle, 'declined'),
          ],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    const [calendarEventId] = await findCalendarEventIds([
      eventId,
      otherEventId,
    ]);

    expect(
      await findParticipantResponseStatusByHandle(calendarEventId),
    ).toEqual({
      [HANDLE]: 'ACCEPTED',
      [decliningGuestHandle]: 'DECLINED',
      [unlistedGuestHandle]: 'ACCEPTED',
    });
  }, 120000);

  it('never lets a guest copy change the fields or another attendee answer while the organizer copy syncs', async () => {
    const { iCalUId, eventId, otherEventId } = buildEventIds();
    const guestHandle = `guest-${randomUUID()}@example.com`;
    const organizer = { emailAddress: { address: OTHER_HANDLE } };
    const organizerTitle = `Organizer title ${randomUUID()}`;
    const guestTitle = `Guest title ${randomUUID()}`;

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: otherEventId,
          iCalUId,
          subject: organizerTitle,
          organizer,
          attendees: [attendee(HANDLE), attendee(guestHandle)],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: eventId,
          iCalUId,
          subject: guestTitle,
          organizer,
          attendees: [
            attendee(HANDLE, 'tentativelyAccepted'),
            attendee(guestHandle, 'declined'),
          ],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    const [calendarEventId] = await findCalendarEventIds([
      eventId,
      otherEventId,
    ]);

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
    const { iCalUId, eventId, otherEventId } = buildEventIds();
    const guestHandle = `guest-${randomUUID()}@example.com`;

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: eventId,
          iCalUId,
          attendees: [attendee(HANDLE), attendee(guestHandle)],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: otherEventId,
          iCalUId,
          attendees: [attendee(OTHER_HANDLE), attendee(guestHandle)],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED,
      value: false,
      expectToFail: false,
    });

    try {
      microsoft.serveCalendarEvents(
        [
          microsoftCalendarEvent({
            id: otherEventId,
            iCalUId,
            attendees: [attendee(OTHER_HANDLE)],
          }),
        ],
        { deltaToken: deltaToken() },
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

    const [calendarEventId] = await findCalendarEventIds([
      eventId,
      otherEventId,
    ]);

    expect(await findParticipantHandles(calendarEventId)).toEqual(
      [HANDLE, OTHER_HANDLE, guestHandle].sort(),
    );
  }, 120000);

  it('offers the attendees of a linked copy for contact creation even when they were already stored', async () => {
    const { iCalUId, eventId, otherEventId } = buildEventIds();
    const guestHandle = `guest-${randomUUID()}@acme.com`;

    await updateCalendarChannel(channel.calendarChannelId, {
      isContactAutoCreationEnabled: false,
    });
    await updateCalendarChannel(otherChannel.calendarChannelId, {
      isContactAutoCreationEnabled: true,
    });

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: eventId,
          iCalUId,
          attendees: [attendee(HANDLE), attendee(guestHandle)],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    expect(await findCreatedPeopleEmails([guestHandle])).toEqual([]);

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: otherEventId,
          iCalUId,
          attendees: [attendee(OTHER_HANDLE), attendee(guestHandle)],
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(otherChannel.calendarChannelId);

    expect(await findCreatedPeopleEmails([guestHandle])).toEqual([guestHandle]);
  }, 120000);

  it('keeps occurrences of the same series apart', async () => {
    const seriesMasterId = `microsoft-calendar-series-${randomUUID()}`;
    const firstOccurrenceId = `${seriesMasterId}-occurrence-1`;
    const secondOccurrenceId = `${seriesMasterId}-occurrence-2`;

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: firstOccurrenceId,
          iCalUId: `${firstOccurrenceId}@microsoft.com`,
          seriesMasterId,
          type: 'occurrence',
        }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarSync(channel.calendarChannelId);

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: secondOccurrenceId,
          iCalUId: `${secondOccurrenceId}@microsoft.com`,
          seriesMasterId,
          type: 'occurrence',
        }),
      ],
      { deltaToken: deltaToken() },
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
