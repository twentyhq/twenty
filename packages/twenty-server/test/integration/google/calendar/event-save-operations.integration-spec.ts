import { randomUUID } from 'node:crypto';

import { type calendar_v3 } from 'googleapis';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'calendar-event-save-operations@apple.dev';

type CalendarEventNode = {
  id: string;
  title: string;
  location: string;
  isFullDay: boolean;
};

type AssociationNode = {
  id: string;
  eventExternalId: string;
  recurringEventExternalId: string;
  calendarEventId: string;
};

type ParticipantNode = {
  id: string;
  handle: string;
  displayName: string;
  isOrganizer: boolean;
  responseStatus: string;
  calendarEventId: string;
};

describe('Calendar event save operations (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const importEvents = async (
    events: calendar_v3.Schema$Event[],
  ): Promise<void> => {
    google.serveCalendarEvents(events, {
      nextSyncToken: `sync-token-${randomUUID()}`,
    });

    await resetCalendarChannelSyncState(channel.calendarChannelId, '');
    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);
  };

  const importEvent = (event: calendar_v3.Schema$Event): Promise<void> =>
    importEvents([event]);

  const findEventsByTitle = (title: string): Promise<CalendarEventNode[]> =>
    findRecordNodesByFilter<CalendarEventNode>(
      'calendarEvent',
      'calendarEvents',
      'id title location isFullDay',
      { title: { eq: title } },
    );

  const findAssociationsByExternalId = (
    eventExternalId: string,
  ): Promise<AssociationNode[]> =>
    findRecordNodesByFilter<AssociationNode>(
      'calendarChannelEventAssociation',
      'calendarChannelEventAssociations',
      'id eventExternalId recurringEventExternalId calendarEventId',
      { eventExternalId: { eq: eventExternalId } },
    );

  const findParticipantsByCalendarEventId = async (
    calendarEventId: string,
  ): Promise<ParticipantNode[]> => {
    const participants = await findRecordNodesByFilter<ParticipantNode>(
      'calendarEventParticipant',
      'calendarEventParticipants',
      'id handle displayName isOrganizer responseStatus calendarEventId',
      { calendarEventId: { eq: calendarEventId } },
    );

    return participants.sort((a, b) => a.handle.localeCompare(b.handle));
  };

  const countParticipantsByHandleSuffix = async (
    handleSuffix: string,
  ): Promise<number> => {
    const rows: { count: string }[] =
      await getCoreRepository<CalendarChannelEntity>(
        CalendarChannelEntity,
      ).manager.query(
        `SELECT count(*) AS count FROM "${getWorkspaceSchemaName(
          SEED_APPLE_WORKSPACE_ID,
        )}"."calendarEventParticipant" WHERE handle LIKE $1`,
        [`%${handleSuffix}`],
      );

    return Number(rows[0].count);
  };

  const countParticipantsByHandleSuffixAndDisplayName = async (
    handleSuffix: string,
    displayName: string,
  ): Promise<number> => {
    const rows: { count: string }[] =
      await getCoreRepository<CalendarChannelEntity>(
        CalendarChannelEntity,
      ).manager.query(
        `SELECT count(*) AS count FROM "${getWorkspaceSchemaName(
          SEED_APPLE_WORKSPACE_ID,
        )}"."calendarEventParticipant" WHERE handle LIKE $1 AND "displayName" = $2`,
        [`%${handleSuffix}`, displayName],
      );

    return Number(rows[0].count);
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('should insert the event, its channel association and its participants on a first import', async () => {
    const eventExternalId = `google-calendar-event-${randomUUID()}`;
    const title = `Calendar event ${randomUUID()}`;
    const attendee = `attendee-${randomUUID()}@acme.com`;

    await importEvent(
      googleCalendarEvent({
        id: eventExternalId,
        summary: title,
        location: 'Room 1',
        attendees: [
          {
            email: attendee,
            displayName: 'Ada Lovelace',
            organizer: true,
            responseStatus: 'accepted',
          },
        ],
      }),
    );

    const events = await findEventsByTitle(title);

    expect(events).toHaveLength(1);
    expect(events[0].location).toBe('Room 1');
    expect(events[0].isFullDay).toBe(false);

    const associations = await findAssociationsByExternalId(eventExternalId);

    expect(associations).toHaveLength(1);
    expect(associations[0].calendarEventId).toBe(events[0].id);
    expect(associations[0].recurringEventExternalId).toBe('');

    const participants = await findParticipantsByCalendarEventId(events[0].id);

    expect(participants).toHaveLength(1);
    expect(participants[0].handle).toBe(attendee);
    expect(participants[0].displayName).toBe('Ada Lovelace');
    expect(participants[0].isOrganizer).toBe(true);
    expect(participants[0].responseStatus).toBe('ACCEPTED');
  }, 120000);

  it('should update the existing event and association rather than insert a second one when the same external event is imported again', async () => {
    const eventExternalId = `google-calendar-event-${randomUUID()}`;
    const initialTitle = `Calendar event ${randomUUID()}`;
    const updatedTitle = `Calendar event ${randomUUID()}`;
    const recurringEventExternalId = `recurring-${randomUUID()}`;
    const attendee = `attendee-${randomUUID()}@acme.com`;

    await importEvent(
      googleCalendarEvent({
        id: eventExternalId,
        summary: initialTitle,
        location: 'Room 1',
        attendees: [{ email: attendee }],
      }),
    );

    const [initialEvent] = await findEventsByTitle(initialTitle);

    await importEvent(
      googleCalendarEvent({
        id: eventExternalId,
        summary: updatedTitle,
        location: 'Room 2',
        recurringEventId: recurringEventExternalId,
        attendees: [{ email: attendee }],
      }),
    );

    expect(await findEventsByTitle(initialTitle)).toHaveLength(0);

    const updatedEvents = await findEventsByTitle(updatedTitle);

    expect(updatedEvents).toHaveLength(1);
    expect(updatedEvents[0].id).toBe(initialEvent.id);
    expect(updatedEvents[0].location).toBe('Room 2');

    const associations = await findAssociationsByExternalId(eventExternalId);

    expect(associations).toHaveLength(1);
    expect(associations[0].recurringEventExternalId).toBe(
      recurringEventExternalId,
    );
  }, 180000);

  it('should update an existing participant in place when its attributes change', async () => {
    const eventExternalId = `google-calendar-event-${randomUUID()}`;
    const title = `Calendar event ${randomUUID()}`;
    const attendee = `attendee-${randomUUID()}@acme.com`;

    await importEvent(
      googleCalendarEvent({
        id: eventExternalId,
        summary: title,
        attendees: [
          {
            email: attendee,
            displayName: 'Before',
            responseStatus: 'needsAction',
          },
        ],
      }),
    );

    const [event] = await findEventsByTitle(title);
    const [initialParticipant] = await findParticipantsByCalendarEventId(
      event.id,
    );

    expect(initialParticipant.displayName).toBe('Before');
    expect(initialParticipant.responseStatus).toBe('NEEDS_ACTION');

    await importEvent(
      googleCalendarEvent({
        id: eventExternalId,
        summary: title,
        attendees: [
          {
            email: attendee,
            displayName: 'After',
            organizer: true,
            responseStatus: 'declined',
          },
        ],
      }),
    );

    const participants = await findParticipantsByCalendarEventId(event.id);

    expect(participants).toHaveLength(1);
    expect(participants[0].id).toBe(initialParticipant.id);
    expect(participants[0].displayName).toBe('After');
    expect(participants[0].isOrganizer).toBe(true);
    expect(participants[0].responseStatus).toBe('DECLINED');
  }, 180000);

  it('should insert an added attendee and delete a removed one while leaving the unchanged attendee alone', async () => {
    const eventExternalId = `google-calendar-event-${randomUUID()}`;
    const title = `Calendar event ${randomUUID()}`;
    const keptAttendee = `attendee-kept-${randomUUID()}@acme.com`;
    const removedAttendee = `attendee-removed-${randomUUID()}@acme.com`;
    const addedAttendee = `attendee-added-${randomUUID()}@acme.com`;

    await importEvent(
      googleCalendarEvent({
        id: eventExternalId,
        summary: title,
        attendees: [{ email: keptAttendee }, { email: removedAttendee }],
      }),
    );

    const [event] = await findEventsByTitle(title);
    const initialParticipants = await findParticipantsByCalendarEventId(
      event.id,
    );

    expect(
      initialParticipants.map((participant) => participant.handle),
    ).toEqual([keptAttendee, removedAttendee].sort());

    const initialKeptParticipant = initialParticipants.find(
      (participant) => participant.handle === keptAttendee,
    );

    await importEvent(
      googleCalendarEvent({
        id: eventExternalId,
        summary: title,
        attendees: [{ email: keptAttendee }, { email: addedAttendee }],
      }),
    );

    const participants = await findParticipantsByCalendarEventId(event.id);

    expect(participants.map((participant) => participant.handle)).toEqual(
      [keptAttendee, addedAttendee].sort(),
    );

    const keptParticipant = participants.find(
      (participant) => participant.handle === keptAttendee,
    );

    expect(keptParticipant?.id).toBe(initialKeptParticipant?.id);
  }, 180000);

  it('should insert every participant when a single import spans more than one insert chunk', async () => {
    const titlePrefix = `Calendar event ${randomUUID()}`;
    const attendeeSuffix = `chunked-${randomUUID()}@acme.com`;

    const events = Array.from({ length: 100 }, (_unused, eventIndex) =>
      googleCalendarEvent({
        id: `google-calendar-event-${eventIndex}-${randomUUID()}`,
        summary: `${titlePrefix} ${eventIndex}`,
        attendees: [
          { email: `a-${eventIndex}-${attendeeSuffix}` },
          { email: `b-${eventIndex}-${attendeeSuffix}` },
          { email: `c-${eventIndex}-${attendeeSuffix}` },
        ],
      }),
    );

    await importEvents(events);

    expect(await countParticipantsByHandleSuffix(attendeeSuffix)).toBe(300);
  }, 300000);

  it('should update every participant when a re-import spans more than one update chunk', async () => {
    const titlePrefix = `Calendar event ${randomUUID()}`;
    const eventIdSuffix = randomUUID();
    const attendeeSuffix = `rechunked-${randomUUID()}@acme.com`;

    const buildEvents = (displayName: string): calendar_v3.Schema$Event[] =>
      Array.from({ length: 100 }, (_unused, eventIndex) =>
        googleCalendarEvent({
          id: `google-calendar-event-${eventIndex}-${eventIdSuffix}`,
          summary: `${titlePrefix} ${eventIndex}`,
          attendees: [
            { email: `a-${eventIndex}-${attendeeSuffix}`, displayName },
            { email: `b-${eventIndex}-${attendeeSuffix}`, displayName },
            { email: `c-${eventIndex}-${attendeeSuffix}`, displayName },
          ],
        }),
      );

    await importEvents(buildEvents('Before'));

    expect(
      await countParticipantsByHandleSuffixAndDisplayName(
        attendeeSuffix,
        'Before',
      ),
    ).toBe(300);

    await importEvents(buildEvents('After'));

    expect(await countParticipantsByHandleSuffix(attendeeSuffix)).toBe(300);
    expect(
      await countParticipantsByHandleSuffixAndDisplayName(
        attendeeSuffix,
        'After',
      ),
    ).toBe(300);
  }, 300000);

  it('should update exactly one row and leave the other untouched when two participants share a handle on the same event', async () => {
    const eventExternalId = `google-calendar-event-${randomUUID()}`;
    const title = `Calendar event ${randomUUID()}`;
    const attendee = `attendee-${randomUUID()}@acme.com`;

    await importEvent(
      googleCalendarEvent({
        id: eventExternalId,
        summary: title,
        attendees: [{ email: attendee, displayName: 'Original' }],
      }),
    );

    const [event] = await findEventsByTitle(title);

    const duplicateResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'calendarEventParticipant',
        gqlFields: 'id',
        data: {
          calendarEventId: event.id,
          handle: attendee,
          displayName: 'Duplicate',
        },
      }),
    );

    expect(duplicateResponse.body.errors).toBeUndefined();
    expect(await findParticipantsByCalendarEventId(event.id)).toHaveLength(2);

    await importEvent(
      googleCalendarEvent({
        id: eventExternalId,
        summary: title,
        attendees: [{ email: attendee, displayName: 'Reconciled' }],
      }),
    );

    const participants = await findParticipantsByCalendarEventId(event.id);

    expect(participants).toHaveLength(2);
    expect(
      participants.filter(
        (participant) => participant.displayName === 'Reconciled',
      ),
    ).toHaveLength(1);
  }, 240000);
});
