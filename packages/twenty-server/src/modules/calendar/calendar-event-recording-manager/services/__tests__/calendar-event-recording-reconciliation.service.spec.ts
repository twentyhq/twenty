import { CalendarEventRecordingReconciliationService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-reconciliation.service';
import { type CalendarEventRecordingPolicyResultForMeeting } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-result-for-meeting.type';
import { CallRecordingRequestStatus } from 'src/modules/call-recording/common/enums/call-recording-request-status.enum';
import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';

const WORKSPACE_ID = 'workspace-1';
const FUTURE_START = '2999-01-01T10:00:00.000Z';
const FUTURE_END = '2999-01-01T10:30:00.000Z';

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
  getRepository: jest.fn(async (_workspaceId: string, entityName: string) => {
    if (entityName === 'calendarEvent') {
      return mockCalendarEventRepository;
    }

    if (entityName === 'callRecording') {
      return mockCallRecordingRepository;
    }

    return {};
  }),
};

const calendarEvent = {
  id: 'event-1',
  title: 'Customer sync',
  startsAt: FUTURE_START,
  endsAt: FUTURE_END,
};

const buildMeetingPolicyResult = (
  overrides: Partial<CalendarEventRecordingPolicyResultForMeeting> = {},
): CalendarEventRecordingPolicyResultForMeeting => ({
  realMeetingKey: 'meeting-1',
  shouldRecord: true,
  calendarEventIds: ['event-1'],
  recordingCalendarEventIds: ['event-1'],
  ...overrides,
});

describe('CalendarEventRecordingReconciliationService', () => {
  let service: CalendarEventRecordingReconciliationService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCalendarEventRepository.findOne.mockResolvedValue(calendarEvent);
    mockCallRecordingRepository.find.mockResolvedValue([]);
    mockCallRecordingRepository.insert.mockResolvedValue({
      identifiers: [{ id: 'recording-created' }],
    });

    service = new CalendarEventRecordingReconciliationService(
      mockGlobalWorkspaceOrmManager as any,
    );
  });

  it('should create a scheduled recording with a requested request status', async () => {
    const results = await service.reconcileMeetingOccurrences({
      workspaceId: WORKSPACE_ID,
      meetingPolicyResults: [buildMeetingPolicyResult()],
    });

    expect(mockCallRecordingRepository.insert).toHaveBeenCalledWith({
      title: 'Customer sync',
      status: CallRecordingStatus.SCHEDULED,
      recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
      startedAt: FUTURE_START,
      endedAt: FUTURE_END,
      calendarEventId: 'event-1',
    });
    expect(results).toEqual([
      {
        action: 'CREATED',
        realMeetingKey: 'meeting-1',
        callRecordingId: 'recording-created',
      },
    ]);
  });

  it('should not overwrite an in-flight recording when policy still requires recording', async () => {
    mockCallRecordingRepository.find.mockResolvedValue([
      {
        id: 'recording-active',
        status: CallRecordingStatus.RECORDING,
        recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
      },
    ]);

    const results = await service.reconcileMeetingOccurrences({
      workspaceId: WORKSPACE_ID,
      meetingPolicyResults: [buildMeetingPolicyResult()],
    });

    expect(mockCallRecordingRepository.update).not.toHaveBeenCalled();
    expect(mockCallRecordingRepository.insert).not.toHaveBeenCalled();
    expect(results).toEqual([
      {
        action: 'SKIPPED',
        realMeetingKey: 'meeting-1',
        callRecordingId: 'recording-active',
      },
    ]);
  });

  it('should re-request a scheduled recording that was previously canceled by policy', async () => {
    mockCallRecordingRepository.find.mockResolvedValue([
      {
        id: 'recording-canceled',
        status: CallRecordingStatus.SCHEDULED,
        recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
      },
    ]);

    const results = await service.reconcileMeetingOccurrences({
      workspaceId: WORKSPACE_ID,
      meetingPolicyResults: [buildMeetingPolicyResult()],
    });

    expect(mockCallRecordingRepository.update).toHaveBeenCalledWith(
      'recording-canceled',
      {
        title: 'Customer sync',
        status: CallRecordingStatus.SCHEDULED,
        recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
        startedAt: FUTURE_START,
        endedAt: FUTURE_END,
        calendarEventId: 'event-1',
      },
    );
    expect(results).toEqual([
      {
        action: 'UPDATED',
        realMeetingKey: 'meeting-1',
        callRecordingId: 'recording-canceled',
      },
    ]);
  });

  it('should only cancel scheduled recordings that are still requested by policy', async () => {
    mockCallRecordingRepository.find.mockResolvedValue([
      {
        id: 'recording-requested',
        status: CallRecordingStatus.SCHEDULED,
        recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
      },
      {
        id: 'recording-active',
        status: CallRecordingStatus.RECORDING,
        recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
      },
      {
        id: 'recording-already-canceled',
        status: CallRecordingStatus.SCHEDULED,
        recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
      },
    ]);

    const results = await service.reconcileMeetingOccurrences({
      workspaceId: WORKSPACE_ID,
      meetingPolicyResults: [
        buildMeetingPolicyResult({
          shouldRecord: false,
          recordingCalendarEventIds: [],
        }),
      ],
    });

    expect(mockCallRecordingRepository.updateMany).toHaveBeenCalledWith([
      {
        criteria: 'recording-requested',
        partialEntity: {
          recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
        },
      },
    ]);
    expect(results).toEqual([
      {
        action: 'CANCELED',
        realMeetingKey: 'meeting-1',
        callRecordingId: 'recording-requested',
      },
    ]);
  });
});
