import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarSaveEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-save-events.service';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

const RECURRING_ICAL_UID = 'recurring-ical-uid@google.com';
const RECURRING_MASTER_ID = 'master_abc';

const mockCalendarEventRepository = {
  insert: jest.fn(),
  updateMany: jest.fn(),
};

const mockAssociationRepository = {
  find: jest.fn(),
  insert: jest.fn(),
  updateMany: jest.fn(),
};

const mockCalendarEventParticipantService = {
  upsertAndDeleteCalendarEventParticipants: jest.fn(),
};

const mockGlobalWorkspaceOrmManager = {
  executeInWorkspaceContext: jest.fn(async (callback: () => Promise<void>) => {
    await callback();
  }),
  getRepository: jest.fn(async (_workspaceId: string, entityName: string) => {
    if (entityName === 'calendarEvent') return mockCalendarEventRepository;
    if (entityName === 'calendarChannelEventAssociation')
      return mockAssociationRepository;

    return {};
  }),
  getGlobalWorkspaceDataSource: jest.fn(async () => ({
    transaction: async (callback: (manager: unknown) => Promise<void>) => {
      await callback({} as any);
    },
  })),
};

const calendarChannel = {
  id: 'channel-123',
} as unknown as CalendarChannelEntity;

const connectedAccount = {
  id: 'account-123',
} as unknown as ConnectedAccountEntity;

const createFetchedEvent = (
  overrides: Partial<FetchedCalendarEvent> = {},
): FetchedCalendarEvent => ({
  id: 'event-1',
  iCalUid: 'single-event-uid@google.com',
  title: 'Team Meeting',
  startsAt: '2026-04-10T16:30:00+03:00',
  endsAt: '2026-04-10T17:00:00+03:00',
  description: '',
  location: '',
  isFullDay: false,
  isCanceled: false,
  conferenceLinkLabel: '',
  conferenceLinkUrl: '',
  externalCreatedAt: '',
  externalUpdatedAt: '',
  conferenceSolution: '',
  participants: [],
  status: 'confirmed',
  ...overrides,
});

describe('CalendarSaveEventsService', () => {
  let service: CalendarSaveEventsService;

  const save = (events: FetchedCalendarEvent[]) =>
    service.saveCalendarEventsAndEnqueueContactCreationJob(
      events,
      calendarChannel,
      connectedAccount,
      'workspace-123',
    );

  beforeEach(() => {
    jest.clearAllMocks();

    mockAssociationRepository.find.mockResolvedValue([]);

    service = new CalendarSaveEventsService(
      mockGlobalWorkspaceOrmManager as any,
      mockCalendarEventParticipantService as any,
    );
  });

  it('should insert each recurring instance as a separate event', async () => {
    await save([
      createFetchedEvent({
        id: `${RECURRING_MASTER_ID}_20260403`,
        iCalUid: RECURRING_ICAL_UID,
        recurringEventExternalId: RECURRING_MASTER_ID,
        startsAt: '2026-04-03T16:30:00+03:00',
      }),
      createFetchedEvent({
        id: `${RECURRING_MASTER_ID}_20260410`,
        iCalUid: RECURRING_ICAL_UID,
        recurringEventExternalId: RECURRING_MASTER_ID,
        startsAt: '2026-04-10T16:30:00+03:00',
      }),
      createFetchedEvent({
        id: `${RECURRING_MASTER_ID}_20260417`,
        iCalUid: RECURRING_ICAL_UID,
        recurringEventExternalId: RECURRING_MASTER_ID,
        startsAt: '2026-04-17T16:30:00+03:00',
      }),
    ]);

    const insertedEvents = mockCalendarEventRepository.insert.mock.calls[0][0];

    expect(insertedEvents).toHaveLength(3);
    expect(new Set(insertedEvents.map((e: any) => e.startsAt))).toEqual(
      new Set([
        '2026-04-03T16:30:00+03:00',
        '2026-04-10T16:30:00+03:00',
        '2026-04-17T16:30:00+03:00',
      ]),
    );
  });

  it('should update existing events and only insert new ones on incremental sync', async () => {
    mockAssociationRepository.find.mockResolvedValueOnce([
      {
        id: 'assoc-403',
        eventExternalId: `${RECURRING_MASTER_ID}_20260403`,
        calendarEventId: 'existing-db-id-403',
        calendarChannelId: calendarChannel.id,
      },
    ]);

    await save([
      createFetchedEvent({
        id: `${RECURRING_MASTER_ID}_20260403`,
        iCalUid: RECURRING_ICAL_UID,
        recurringEventExternalId: RECURRING_MASTER_ID,
        title: 'Weekly Sync (Renamed)',
        startsAt: '2026-04-03T16:30:00+03:00',
      }),
      createFetchedEvent({
        id: `${RECURRING_MASTER_ID}_20260410`,
        iCalUid: RECURRING_ICAL_UID,
        startsAt: '2026-04-10T16:30:00+03:00',
      }),
    ]);

    const insertedEvents = mockCalendarEventRepository.insert.mock.calls[0][0];

    expect(insertedEvents).toHaveLength(1);
    expect(insertedEvents[0].startsAt).toBe('2026-04-10T16:30:00+03:00');

    const updatedEvents =
      mockCalendarEventRepository.updateMany.mock.calls[0][0];

    expect(updatedEvents).toHaveLength(1);
    expect(updatedEvents[0].criteria).toBe('existing-db-id-403');
    expect(updatedEvents[0].partialEntity.title).toBe('Weekly Sync (Renamed)');

    const insertedAssociations =
      mockAssociationRepository.insert.mock.calls[0][0];

    expect(insertedAssociations).toHaveLength(1);
    expect(insertedAssociations[0].eventExternalId).toBe(
      `${RECURRING_MASTER_ID}_20260410`,
    );
  });

  it('should only update without inserting when all events already exist', async () => {
    mockAssociationRepository.find.mockResolvedValueOnce([
      {
        id: 'assoc-1',
        eventExternalId: 'event-1',
        calendarEventId: 'db-id-1',
        calendarChannelId: calendarChannel.id,
      },
      {
        id: 'assoc-2',
        eventExternalId: 'event-2',
        calendarEventId: 'db-id-2',
        calendarChannelId: calendarChannel.id,
      },
    ]);

    await save([
      createFetchedEvent({ id: 'event-1' }),
      createFetchedEvent({ id: 'event-2' }),
    ]);

    expect(mockCalendarEventRepository.insert).not.toHaveBeenCalled();
    expect(mockCalendarEventRepository.updateMany).toHaveBeenCalledTimes(1);
    expect(mockAssociationRepository.insert).not.toHaveBeenCalled();
    expect(mockAssociationRepository.updateMany).toHaveBeenCalledTimes(1);
  });
});
