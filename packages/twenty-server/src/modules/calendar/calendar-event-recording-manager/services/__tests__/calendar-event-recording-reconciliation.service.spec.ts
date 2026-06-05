import { CalendarEventRecordingReconciliationService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-reconciliation.service';
import { type RealMeetingRecordingAggregate } from 'src/modules/calendar/calendar-event-recording-manager/types/real-meeting-recording-aggregate.type';
import { type RemovedRecordingOccurrence } from 'src/modules/calendar/calendar-event-recording-manager/types/removed-recording-occurrence.type';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

const MEETING_KEY =
  'link:meet.google.com/abc-defg-hij:2999-01-01T10:00:00.000Z';

const buildCalendarEvent = (
  overrides: Partial<CalendarEventWorkspaceEntity> = {},
): CalendarEventWorkspaceEntity =>
  ({
    id: 'event-1',
    title: 'Customer sync',
    startsAt: '2999-01-01T10:00:00.000Z',
    endsAt: '2999-01-01T11:00:00.000Z',
    ...overrides,
  }) as CalendarEventWorkspaceEntity;

const buildCallRecording = (
  overrides: Partial<CallRecordingWorkspaceEntity> = {},
): CallRecordingWorkspaceEntity =>
  ({
    id: 'call-recording-1',
    status: 'SCHEDULED',
    calendarEventId: 'event-1',
    ...overrides,
  }) as CallRecordingWorkspaceEntity;

const buildActiveAggregate = (
  overrides: Partial<RealMeetingRecordingAggregate> = {},
): RealMeetingRecordingAggregate => ({
  realMeetingKey: MEETING_KEY,
  providerIntent: 'ACTIVE',
  calendarEventIds: ['event-1'],
  activeCalendarEventIds: ['event-1'],
  ...overrides,
});

const buildCanceledAggregate = (
  overrides: Partial<RealMeetingRecordingAggregate> = {},
): RealMeetingRecordingAggregate => ({
  realMeetingKey: MEETING_KEY,
  providerIntent: 'CANCELED',
  calendarEventIds: ['event-1'],
  activeCalendarEventIds: [],
  ...overrides,
});

const mockCalendarEventRepository = {
  findOne: jest.fn(),
};

const mockCallRecordingRepository = {
  find: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
};

const mockGlobalWorkspaceOrmManager = {
  executeInWorkspaceContext: jest.fn(async (callback: () => Promise<unknown>) =>
    callback(),
  ),
  getRepository: jest.fn(),
};

describe('CalendarEventRecordingReconciliationService', () => {
  let service: CalendarEventRecordingReconciliationService;

  const reconcile = (
    meetingAggregates: RealMeetingRecordingAggregate[],
    removedOccurrences: RemovedRecordingOccurrence[] = [],
  ) =>
    service.reconcileMeetingOccurrences({
      workspaceId: 'workspace-1',
      meetingAggregates,
      removedOccurrences,
    });

  beforeEach(() => {
    jest.clearAllMocks();

    mockGlobalWorkspaceOrmManager.getRepository.mockImplementation(
      async (_workspaceId: string, objectName: string) => {
        if (objectName === 'calendarEvent') {
          return mockCalendarEventRepository;
        }

        if (objectName === 'callRecording') {
          return mockCallRecordingRepository;
        }

        throw new Error(`Unexpected repository ${objectName}`);
      },
    );

    mockCalendarEventRepository.findOne.mockResolvedValue(buildCalendarEvent());
    mockCallRecordingRepository.find.mockResolvedValue([]);
    mockCallRecordingRepository.insert.mockResolvedValue({
      identifiers: [{ id: 'call-recording-1' }],
    });
    mockCallRecordingRepository.update.mockResolvedValue({});
    mockCallRecordingRepository.updateMany.mockResolvedValue({});

    service = new CalendarEventRecordingReconciliationService(
      mockGlobalWorkspaceOrmManager as any,
    );
  });

  it('should create a scheduled call recording for an active meeting without an existing lifecycle row', async () => {
    const results = await reconcile([buildActiveAggregate()]);

    expect(mockCallRecordingRepository.insert).toHaveBeenCalledWith({
      title: 'Customer sync',
      status: 'SCHEDULED',
      startedAt: '2999-01-01T10:00:00.000Z',
      endedAt: '2999-01-01T11:00:00.000Z',
      calendarEventId: 'event-1',
    });
    expect(results).toEqual([
      {
        action: 'CREATED',
        realMeetingKey: MEETING_KEY,
        callRecordingId: 'call-recording-1',
      },
    ]);
  });

  it('should update an existing sibling call recording instead of creating a duplicate', async () => {
    mockCallRecordingRepository.find.mockResolvedValue([
      buildCallRecording({
        id: 'call-recording-2',
        calendarEventId: 'event-2',
        status: 'CANCELED',
      }),
    ]);

    const results = await reconcile([
      buildActiveAggregate({
        calendarEventIds: ['event-1', 'event-2'],
        activeCalendarEventIds: ['event-1'],
      }),
    ]);

    expect(mockCallRecordingRepository.update).toHaveBeenCalledWith(
      'call-recording-2',
      {
        title: 'Customer sync',
        status: 'SCHEDULED',
        startedAt: '2999-01-01T10:00:00.000Z',
        endedAt: '2999-01-01T11:00:00.000Z',
        calendarEventId: 'event-1',
      },
    );
    expect(mockCallRecordingRepository.insert).not.toHaveBeenCalled();
    expect(results[0]).toEqual({
      action: 'UPDATED',
      realMeetingKey: MEETING_KEY,
      callRecordingId: 'call-recording-2',
    });
  });

  it('should cancel an existing call recording using the removed calendar event id', async () => {
    mockCallRecordingRepository.find.mockResolvedValue([buildCallRecording()]);

    const results = await reconcile(
      [buildCanceledAggregate({ calendarEventIds: [] })],
      [
        {
          calendarEventId: 'event-1',
          realMeetingKey: MEETING_KEY,
          startsAt: '2999-01-01T10:00:00.000Z',
        },
      ],
    );

    expect(mockCallRecordingRepository.updateMany).toHaveBeenCalledWith([
      {
        criteria: 'call-recording-1',
        partialEntity: { status: 'CANCELED' },
      },
    ]);
    expect(results[0]).toEqual({
      action: 'CANCELED',
      realMeetingKey: MEETING_KEY,
      callRecordingId: 'call-recording-1',
    });
  });

  it('should leave completed recordings untouched on cancel intent', async () => {
    mockCallRecordingRepository.find.mockResolvedValue([
      buildCallRecording({ status: 'COMPLETED' }),
    ]);

    const results = await reconcile([buildCanceledAggregate()]);

    expect(mockCallRecordingRepository.updateMany).not.toHaveBeenCalled();
    expect(results[0]).toEqual({
      action: 'SKIPPED',
      realMeetingKey: MEETING_KEY,
      callRecordingId: null,
    });
  });

  it('should process cancel intents before active intents for a changed meeting key', async () => {
    mockCallRecordingRepository.find.mockResolvedValue([buildCallRecording()]);

    await reconcile(
      [
        buildActiveAggregate(),
        buildCanceledAggregate({ calendarEventIds: [] }),
      ],
      [
        {
          calendarEventId: 'event-1',
          realMeetingKey: MEETING_KEY,
          startsAt: '2999-01-01T10:00:00.000Z',
        },
      ],
    );

    expect(
      mockCallRecordingRepository.updateMany.mock.invocationCallOrder[0],
    ).toBeLessThan(
      mockCallRecordingRepository.update.mock.invocationCallOrder[0],
    );
  });
});
