import { CalendarChannelSyncStatus } from 'twenty-shared/types';

import { type CalendarEventSharingChannel } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-sharing-channel.type';
import { buildCalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/utils/build-calendar-event-save-operations.util';
import { type ComparableCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/utils/has-calendar-event-changed.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { buildFetchedCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/utils/__tests__/build-fetched-calendar-event.test-util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

const CALENDAR_CHANNEL_ID = 'calendar-channel-id';
const CALENDAR_EVENT_ID = 'calendar-event-id';
const ASSOCIATION_ID = 'association-id';
const CHANNEL_HANDLE = 'owner@example.com';

const buildExistingCalendarEvent = (
  overrides: Partial<ComparableCalendarEvent> = {},
): ComparableCalendarEvent => ({
  id: CALENDAR_EVENT_ID,
  title: 'Weekly sync',
  iCalUid: 'ical-uid',
  description: 'Agenda',
  startsAt: '2026-10-02T08:00:00.000Z',
  endsAt: '2026-10-02T09:00:00.000Z',
  location: null,
  isFullDay: false,
  isCanceled: false,
  conferenceSolution: 'hangoutsMeet',
  conferenceLink: {
    primaryLinkLabel: 'Meet',
    primaryLinkUrl: 'https://meet.example.com/abc',
    secondaryLinks: null,
  },
  ...overrides,
});

const buildExistingAssociation = (
  overrides: Partial<CalendarChannelEventAssociationWorkspaceEntity> = {},
): CalendarChannelEventAssociationWorkspaceEntity =>
  ({
    id: ASSOCIATION_ID,
    calendarEventId: CALENDAR_EVENT_ID,
    calendarChannelId: CALENDAR_CHANNEL_ID,
    eventExternalId: 'external-event-id',
    recurringEventExternalId: '',
    ...overrides,
  }) as CalendarChannelEventAssociationWorkspaceEntity;

const buildCalendarChannel = ({
  id,
  handle,
}: {
  id: string;
  handle: string;
}): CalendarEventSharingChannel => ({
  id,
  handle,
  syncStatus: CalendarChannelSyncStatus.ACTIVE,
  isSyncEnabled: true,
  connectedAccount: { handleAliases: [] },
});

const ATTENDEE_CHANNEL = buildCalendarChannel({
  id: 'attendee-channel-id',
  handle: 'attendee@example.com',
});

const buildPlan = ({
  fetchedCalendarEvents,
  existingAssociations,
  existingCalendarEvents,
  calendarEventIdToLinkByEventExternalId = new Map(),
  otherCalendarChannels = [],
}: {
  fetchedCalendarEvents: FetchedCalendarEvent[];
  existingAssociations: CalendarChannelEventAssociationWorkspaceEntity[];
  existingCalendarEvents: ComparableCalendarEvent[];
  calendarEventIdToLinkByEventExternalId?: Map<string, string>;
  otherCalendarChannels?: CalendarEventSharingChannel[];
}) =>
  buildCalendarEventSaveOperations({
    fetchedCalendarEvents,
    existingAssociations,
    existingCalendarEvents,
    calendarChannelId: CALENDAR_CHANNEL_ID,
    channelHandles: [CHANNEL_HANDLE],
    calendarEventIdToLinkByEventExternalId,
    otherChannelIdsByCalendarEventId: new Map([
      [CALENDAR_EVENT_ID, otherCalendarChannels.map(({ id }) => id)],
    ]),
    otherCalendarChannels,
  });

describe('buildCalendarEventSaveOperations', () => {
  it('skips updates for an existing event that did not change', () => {
    const plan = buildPlan({
      fetchedCalendarEvents: [buildFetchedCalendarEvent()],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [buildExistingCalendarEvent()],
    });

    expect(plan.saveOperations).toEqual({
      calendarEventsToInsert: [],
      calendarEventsToUpdate: [],
      associationsToInsert: [],
      associationsToUpdate: [],
    });
    expect(plan.existingCalendarEventIds).toEqual([CALENDAR_EVENT_ID]);
    expect(plan.participantsOfExistingEvents).toEqual([
      {
        handle: 'john@example.com',
        displayName: 'John Doe',
        responseStatus: 'ACCEPTED',
        isOrganizer: true,
        calendarEventId: CALENDAR_EVENT_ID,
      },
    ]);
  });

  it('ignores provider bookkeeping timestamps when nothing else changed', () => {
    const plan = buildPlan({
      fetchedCalendarEvents: [
        buildFetchedCalendarEvent({
          externalCreatedAt: '2026-10-02T15:00:00.000Z',
          externalUpdatedAt: '2026-10-02T15:00:00.000Z',
        }),
      ],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [buildExistingCalendarEvent()],
    });

    expect(plan.saveOperations.calendarEventsToUpdate).toEqual([]);
  });

  it('reads timestamps without an offset as UTC like the database does', () => {
    const plan = buildPlan({
      fetchedCalendarEvents: [
        buildFetchedCalendarEvent({
          startsAt: '2026-10-02T08:00:00.0000000',
          endsAt: '2026-10-02T09:00:00.0000000',
        }),
      ],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [buildExistingCalendarEvent()],
    });

    expect(plan.saveOperations.calendarEventsToUpdate).toEqual([]);
  });

  it('treats an empty fetched end date as equal to a null persisted one', () => {
    const plan = buildPlan({
      fetchedCalendarEvents: [buildFetchedCalendarEvent({ endsAt: '' })],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [buildExistingCalendarEvent({ endsAt: null })],
    });

    expect(plan.saveOperations.calendarEventsToUpdate).toEqual([]);
  });

  it.each<[string, Partial<FetchedCalendarEvent>, Record<string, unknown>]>([
    [
      'title',
      { title: 'Weekly sync (moved)' },
      { title: 'Weekly sync (moved)' },
    ],
    [
      'startsAt',
      { startsAt: '2026-10-02T10:30:00+02:00' },
      { startsAt: '2026-10-02T10:30:00+02:00' },
    ],
    ['isCanceled', { isCanceled: true }, { isCanceled: true }],
    [
      'conference link',
      { conferenceLinkUrl: 'https://meet.example.com/xyz' },
      {
        conferenceLink: {
          primaryLinkLabel: 'Meet',
          primaryLinkUrl: 'https://meet.example.com/xyz',
          secondaryLinks: [],
        },
      },
    ],
    ['location', { location: 'Room 1' }, { location: 'Room 1' }],
  ])(
    'updates an existing event when its %s changed',
    (_, overrides, written) => {
      const plan = buildPlan({
        fetchedCalendarEvents: [buildFetchedCalendarEvent(overrides)],
        existingAssociations: [buildExistingAssociation()],
        existingCalendarEvents: [buildExistingCalendarEvent()],
      });

      expect(plan.saveOperations.calendarEventsToUpdate).toEqual([
        {
          criteria: CALENDAR_EVENT_ID,
          partialEntity: expect.objectContaining(written),
        },
      ]);
      expect(plan.saveOperations.associationsToUpdate).toEqual([]);
    },
  );

  it('updates an existing event that has secondary links to clear them', () => {
    const plan = buildPlan({
      fetchedCalendarEvents: [buildFetchedCalendarEvent()],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [
        buildExistingCalendarEvent({
          conferenceLink: {
            primaryLinkLabel: 'Meet',
            primaryLinkUrl: 'https://meet.example.com/abc',
            secondaryLinks: [{ url: 'https://example.com', label: '' }],
          },
        }),
      ],
    });

    expect(plan.saveOperations.calendarEventsToUpdate).toHaveLength(1);
  });

  it('updates the event and its association when the event was not loaded', () => {
    const plan = buildPlan({
      fetchedCalendarEvents: [buildFetchedCalendarEvent()],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [],
    });

    expect(plan.saveOperations.calendarEventsToUpdate).toHaveLength(1);
    expect(plan.saveOperations.associationsToUpdate).toEqual([
      {
        criteria: ASSOCIATION_ID,
        partialEntity: { recurringEventExternalId: '' },
      },
    ]);
  });

  it('updates the association only when the recurring event id changed', () => {
    const plan = buildPlan({
      fetchedCalendarEvents: [
        buildFetchedCalendarEvent({ recurringEventExternalId: 'recurring-id' }),
      ],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [buildExistingCalendarEvent()],
    });

    expect(plan.saveOperations.calendarEventsToUpdate).toEqual([]);
    expect(plan.saveOperations.associationsToUpdate).toEqual([
      {
        criteria: ASSOCIATION_ID,
        partialEntity: { recurringEventExternalId: 'recurring-id' },
      },
    ]);
  });

  it('inserts events that have no existing association', () => {
    const plan = buildPlan({
      fetchedCalendarEvents: [buildFetchedCalendarEvent()],
      existingAssociations: [],
      existingCalendarEvents: [],
    });

    expect(plan.saveOperations.calendarEventsToInsert).toHaveLength(1);
    expect(plan.saveOperations.associationsToInsert).toEqual([
      {
        calendarEventId: plan.saveOperations.calendarEventsToInsert[0].id,
        eventExternalId: 'external-event-id',
        calendarChannelId: CALENDAR_CHANNEL_ID,
        recurringEventExternalId: '',
      },
    ]);
    expect(plan.existingCalendarEventIds).toEqual([]);
    expect(plan.participantsOfNewEvents).toHaveLength(1);
  });

  it('links an event stored by another channel instead of inserting a second one', () => {
    const plan = buildPlan({
      fetchedCalendarEvents: [buildFetchedCalendarEvent()],
      existingAssociations: [],
      existingCalendarEvents: [buildExistingCalendarEvent()],
      calendarEventIdToLinkByEventExternalId: new Map([
        ['external-event-id', CALENDAR_EVENT_ID],
      ]),
      otherCalendarChannels: [ATTENDEE_CHANNEL],
    });

    expect(plan.saveOperations).toEqual({
      calendarEventsToInsert: [],
      calendarEventsToUpdate: [],
      associationsToInsert: [
        {
          calendarEventId: CALENDAR_EVENT_ID,
          eventExternalId: 'external-event-id',
          calendarChannelId: CALENDAR_CHANNEL_ID,
          recurringEventExternalId: '',
        },
      ],
      associationsToUpdate: [],
    });
    expect(plan.existingCalendarEventIds).toEqual([]);
    expect(plan.participantsOfNewEvents).toEqual([]);
    expect(plan.participantsOfExistingEvents).toEqual([]);
    expect(plan.participantsOfLinkedEvents).toEqual([
      expect.objectContaining({
        handle: 'john@example.com',
        calendarEventId: CALENDAR_EVENT_ID,
      }),
    ]);
  });
});
