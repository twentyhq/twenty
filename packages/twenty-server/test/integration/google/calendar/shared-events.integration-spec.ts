import { randomUUID } from 'node:crypto';

import { type calendar_v3 } from 'googleapis';
import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'google-calendar-shared-events@apple.dev';
const OTHER_HANDLE = 'google-calendar-shared-events-other@apple.dev';

type AssociationNode = {
  calendarChannelId: string;
  calendarEventId: string;
};

type ParticipantNode = {
  handle: string;
};

const attendee = (email: string): calendar_v3.Schema$EventAttendee => ({
  email,
  displayName: email,
  responseStatus: 'accepted',
});

describe('Google calendar events shared across channels (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let otherChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const importAs = async (
    accountHandle: string,
    calendarChannelId: string,
    events: calendar_v3.Schema$Event[],
  ): Promise<void> => {
    google.actAsAccount(accountHandle);
    google.serveCalendarEvents(events, {
      nextSyncToken: `shared-events-sync-token-${randomUUID()}`,
    });

    await resetCalendarChannelSyncState(calendarChannelId, '');
    await runCalendarChannelListFetch(calendarChannelId);
    await runCalendarChannelEventsImport(calendarChannelId);
  };

  const findAssociations = (
    eventExternalId: string,
  ): Promise<AssociationNode[]> =>
    findRecordNodesByFilter<AssociationNode>(
      'calendarChannelEventAssociation',
      'calendarChannelEventAssociations',
      'calendarChannelId calendarEventId',
      { eventExternalId: { eq: eventExternalId } },
    );

  const findParticipantHandles = async (
    calendarEventId: string,
  ): Promise<string[]> =>
    (
      await findRecordNodesByFilter<ParticipantNode>(
        'calendarEventParticipant',
        'calendarEventParticipants',
        'handle',
        { calendarEventId: { eq: calendarEventId } },
      )
    )
      .map(({ handle }) => handle)
      .sort();

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

    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED,
      value: true,
      expectToFail: false,
    });
  }, 120000);

  afterAll(async () => {
    await otherChannel?.cleanup().catch(() => undefined);
    await channel?.cleanup().catch(() => undefined);
  });

  it('stores an occurrence synced by two channels once', async () => {
    const eventExternalId = `series_${randomUUID()}_20261012T090000Z`;
    const event = googleCalendarEvent({
      id: eventExternalId,
      attendees: [attendee(HANDLE), attendee(OTHER_HANDLE)],
    });

    await importAs(HANDLE, channel.calendarChannelId, [event]);
    await importAs(OTHER_HANDLE, otherChannel.calendarChannelId, [event]);

    const associations = await findAssociations(eventExternalId);

    expect(
      associations.map(({ calendarChannelId }) => calendarChannelId).sort(),
    ).toEqual(
      [channel.calendarChannelId, otherChannel.calendarChannelId].sort(),
    );
    expect(
      new Set(associations.map(({ calendarEventId }) => calendarEventId)).size,
    ).toBe(1);
    expect(
      await findParticipantHandles(associations[0].calendarEventId),
    ).toEqual([HANDLE, OTHER_HANDLE].sort());
  }, 120000);

  it('keeps occurrences of the same series apart', async () => {
    const seriesId = `series_${randomUUID()}`;
    const iCalUID = `${seriesId}@google.com`;
    const firstOccurrenceId = `${seriesId}_20261012T090000Z`;
    const secondOccurrenceId = `${seriesId}_20261019T090000Z`;

    await importAs(HANDLE, channel.calendarChannelId, [
      googleCalendarEvent({
        id: firstOccurrenceId,
        iCalUID,
        recurringEventId: seriesId,
      }),
    ]);
    await importAs(OTHER_HANDLE, otherChannel.calendarChannelId, [
      googleCalendarEvent({
        id: secondOccurrenceId,
        iCalUID,
        recurringEventId: seriesId,
      }),
    ]);

    const [firstAssociation] = await findAssociations(firstOccurrenceId);
    const [secondAssociation] = await findAssociations(secondOccurrenceId);

    expect(firstAssociation.calendarEventId).not.toBe(
      secondAssociation.calendarEventId,
    );
  }, 120000);

  it('keeps attendees that another channel copy does not list', async () => {
    const eventExternalId = `google-calendar-event-${randomUUID()}`;
    const guestHandle = `guest-${randomUUID()}@example.com`;

    await importAs(HANDLE, channel.calendarChannelId, [
      googleCalendarEvent({
        id: eventExternalId,
        attendees: [
          attendee(HANDLE),
          attendee(OTHER_HANDLE),
          attendee(guestHandle),
        ],
      }),
    ]);
    await importAs(OTHER_HANDLE, otherChannel.calendarChannelId, [
      googleCalendarEvent({
        id: eventExternalId,
        attendees: [attendee(OTHER_HANDLE)],
      }),
    ]);

    const [association] = await findAssociations(eventExternalId);

    expect(await findParticipantHandles(association.calendarEventId)).toEqual(
      [HANDLE, OTHER_HANDLE, guestHandle].sort(),
    );
  }, 120000);

  it('keeps one copy per channel when the flag is off', async () => {
    const eventExternalId = `google-calendar-event-${randomUUID()}`;
    const event = googleCalendarEvent({ id: eventExternalId });

    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED,
      value: false,
      expectToFail: false,
    });

    try {
      await importAs(HANDLE, channel.calendarChannelId, [event]);
      await importAs(OTHER_HANDLE, otherChannel.calendarChannelId, [event]);
    } finally {
      await updateFeatureFlag({
        featureFlag:
          FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED,
        value: true,
        expectToFail: false,
      });
    }

    const associations = await findAssociations(eventExternalId);

    expect(
      new Set(associations.map(({ calendarEventId }) => calendarEventId)).size,
    ).toBe(2);
  }, 120000);
});
