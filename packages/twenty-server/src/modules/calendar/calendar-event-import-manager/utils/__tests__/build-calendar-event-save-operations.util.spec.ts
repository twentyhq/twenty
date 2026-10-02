import { buildCalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/utils/build-calendar-event-save-operations.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

const CALENDAR_CHANNEL_ID = 'calendar-channel-id';
const CALENDAR_EVENT_ID = 'calendar-event-id';
const ASSOCIATION_ID = 'association-id';

const buildFetchedCalendarEvent = (
  overrides: Partial<FetchedCalendarEvent> = {},
): FetchedCalendarEvent => ({
  id: 'external-event-id',
  title: 'Weekly sync',
  iCalUid: 'ical-uid',
  description: 'Agenda',
  startsAt: '2026-10-02T10:00:00+02:00',
  endsAt: '2026-10-02T11:00:00+02:00',
  location: '',
  isFullDay: false,
  isCanceled: false,
  conferenceLinkLabel: 'Meet',
  conferenceLinkUrl: 'https://meet.example.com/abc',
  externalCreatedAt: '2026-09-01T08:00:00.000Z',
  externalUpdatedAt: '2026-09-15T08:00:00.000Z',
  conferenceSolution: 'hangoutsMeet',
  participants: [
    {
      handle: 'john@example.com',
      displayName: 'John Doe',
      responseStatus: 'ACCEPTED',
      isOrganizer: true,
    },
  ],
  status: 'confirmed',
  ...overrides,
});

const buildExistingCalendarEvent = (
  overrides: Partial<CalendarEventWorkspaceEntity> = {},
): CalendarEventWorkspaceEntity =>
  ({
    id: CALENDAR_EVENT_ID,
    title: 'Weekly sync',
    iCalUid: 'ical-uid',
    description: 'Agenda',
    startsAt: new Date('2026-10-02T08:00:00.000Z'),
    endsAt: new Date('2026-10-02T09:00:00.000Z'),
    location: null,
    isFullDay: false,
    isCanceled: false,
    conferenceSolution: 'hangoutsMeet',
    conferenceLink: {
      primaryLinkLabel: 'Meet',
      primaryLinkUrl: 'https://meet.example.com/abc',
      secondaryLinks: null,
    },
    externalCreatedAt: new Date('2026-09-01T08:00:00.000Z'),
    externalUpdatedAt: new Date('2026-09-15T08:00:00.000Z'),
    ...overrides,
  }) as unknown as CalendarEventWorkspaceEntity;

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

describe('buildCalendarEventSaveOperations', () => {
  it('skips updates for an existing event that did not change', () => {
    const plan = buildCalendarEventSaveOperations({
      fetchedCalendarEvents: [buildFetchedCalendarEvent()],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [buildExistingCalendarEvent()],
      calendarChannelId: CALENDAR_CHANNEL_ID,
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

  it.each<[string, Partial<FetchedCalendarEvent>]>([
    ['title', { title: 'Weekly sync (moved)' }],
    ['startsAt', { startsAt: '2026-10-02T10:30:00+02:00' }],
    ['isCanceled', { isCanceled: true }],
    ['conference link', { conferenceLinkUrl: 'https://meet.example.com/xyz' }],
    ['location', { location: 'Room 1' }],
  ])('updates an existing event when its %s changed', (_, overrides) => {
    const plan = buildCalendarEventSaveOperations({
      fetchedCalendarEvents: [buildFetchedCalendarEvent(overrides)],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [buildExistingCalendarEvent()],
      calendarChannelId: CALENDAR_CHANNEL_ID,
    });

    expect(plan.saveOperations.calendarEventsToUpdate).toEqual([
      {
        criteria: CALENDAR_EVENT_ID,
        partialEntity: expect.objectContaining({
          title: overrides.title ?? 'Weekly sync',
        }),
      },
    ]);
    expect(plan.saveOperations.associationsToUpdate).toEqual([]);
  });

  it('updates an existing event that has secondary links to clear them', () => {
    const plan = buildCalendarEventSaveOperations({
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
      calendarChannelId: CALENDAR_CHANNEL_ID,
    });

    expect(plan.saveOperations.calendarEventsToUpdate).toHaveLength(1);
  });

  it('updates an existing event that could not be loaded', () => {
    const plan = buildCalendarEventSaveOperations({
      fetchedCalendarEvents: [buildFetchedCalendarEvent()],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [],
      calendarChannelId: CALENDAR_CHANNEL_ID,
    });

    expect(plan.saveOperations.calendarEventsToUpdate).toHaveLength(1);
  });

  it('updates the association only when the recurring event id changed', () => {
    const plan = buildCalendarEventSaveOperations({
      fetchedCalendarEvents: [
        buildFetchedCalendarEvent({ recurringEventExternalId: 'recurring-id' }),
      ],
      existingAssociations: [buildExistingAssociation()],
      existingCalendarEvents: [buildExistingCalendarEvent()],
      calendarChannelId: CALENDAR_CHANNEL_ID,
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
    const plan = buildCalendarEventSaveOperations({
      fetchedCalendarEvents: [buildFetchedCalendarEvent()],
      existingAssociations: [],
      existingCalendarEvents: [],
      calendarChannelId: CALENDAR_CHANNEL_ID,
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
});
