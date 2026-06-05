import { CalendarEventRecordingDecisionService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-decision.service';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

const buildCalendarEvent = (
  overrides: Partial<CalendarEventWorkspaceEntity> = {},
): CalendarEventWorkspaceEntity =>
  ({
    id: 'event-1',
    recordingPreference: 'AUTO',
    isCanceled: false,
    // Far future so the "upcoming" check never depends on the wall clock.
    startsAt: '2999-01-01T10:00:00.000Z',
    endsAt: '2999-01-01T11:00:00.000Z',
    iCalUid: 'ical-1',
    conferenceLink: {
      primaryLinkLabel: '',
      primaryLinkUrl: 'https://meet.google.com/abc-defg-hij',
      secondaryLinks: null,
    },
    calendarEventParticipants: [{ workspaceMemberId: null }],
    ...overrides,
  }) as unknown as CalendarEventWorkspaceEntity;

const mockCalendarEventRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockGlobalWorkspaceOrmManager = {
  executeInWorkspaceContext: jest.fn(async (callback: () => Promise<unknown>) =>
    callback(),
  ),
  getRepository: jest.fn(async () => mockCalendarEventRepository),
};

const mockFeatureFlagService = {
  isFeatureEnabled: jest.fn(),
};

describe('CalendarEventRecordingDecisionService', () => {
  let service: CalendarEventRecordingDecisionService;

  const evaluate = () =>
    service.evaluateCalendarEvent({
      workspaceId: 'workspace-1',
      calendarEventId: 'event-1',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFeatureFlagService.isFeatureEnabled.mockResolvedValue(true);
    service = new CalendarEventRecordingDecisionService(
      mockGlobalWorkspaceOrmManager as any,
      mockFeatureFlagService as any,
    );
  });

  it('should request recording for an AUTO event matching policy and expose the meeting key', async () => {
    mockCalendarEventRepository.findOne.mockResolvedValue(buildCalendarEvent());

    const result = await evaluate();

    expect(result).toEqual({
      workspaceId: 'workspace-1',
      calendarEventId: 'event-1',
      found: true,
      recordingPreference: 'AUTO',
      realMeetingKey:
        'link:meet.google.com/abc-defg-hij:2999-01-01T10:00:00.000Z',
      eventIntent: 'ACTIVE',
      reason: 'AUTO_POLICY_MATCHED',
    });
  });

  it('should request recording for an ON event even without a conference link or external participant', async () => {
    mockCalendarEventRepository.findOne.mockResolvedValue(
      buildCalendarEvent({
        recordingPreference: 'ON',
        conferenceLink:
          null as unknown as CalendarEventWorkspaceEntity['conferenceLink'],
        calendarEventParticipants: [],
      }),
    );

    const result = await evaluate();

    expect(result.eventIntent).toBe('ACTIVE');
    expect(result.reason).toBe('PREFERENCE_ON');
  });

  it('should cancel intent for an OFF event', async () => {
    mockCalendarEventRepository.findOne.mockResolvedValue(
      buildCalendarEvent({ recordingPreference: 'OFF' }),
    );

    const result = await evaluate();

    expect(result.eventIntent).toBe('CANCELED');
    expect(result.reason).toBe('PREFERENCE_OFF');
  });

  it('should not request recording for an AUTO event with only internal participants', async () => {
    mockCalendarEventRepository.findOne.mockResolvedValue(
      buildCalendarEvent({
        calendarEventParticipants: [
          { workspaceMemberId: 'workspace-member-1' },
        ] as unknown as CalendarEventWorkspaceEntity['calendarEventParticipants'],
      }),
    );

    const result = await evaluate();

    expect(result.eventIntent).toBe('CANCELED');
    expect(result.reason).toBe('AUTO_NO_EXTERNAL_PARTICIPANT');
  });

  it('should cancel intent when call recording is disabled for the workspace', async () => {
    mockFeatureFlagService.isFeatureEnabled.mockResolvedValue(false);
    mockCalendarEventRepository.findOne.mockResolvedValue(
      buildCalendarEvent({ recordingPreference: 'ON' }),
    );

    const result = await evaluate();

    expect(result.eventIntent).toBe('CANCELED');
    expect(result.reason).toBe('WORKSPACE_RECORDING_DISABLED');
  });

  it('should return a not-found result when the calendar event does not exist', async () => {
    mockCalendarEventRepository.findOne.mockResolvedValue(null);

    const result = await evaluate();

    expect(result.found).toBe(false);
    expect(result.eventIntent).toBeNull();
    expect(result.realMeetingKey).toBeNull();
  });

  describe('evaluateMeetingOccurrences', () => {
    const MEETING_KEY =
      'link:meet.google.com/abc-defg-hij:2999-01-01T10:00:00.000Z';

    it('should keep a meeting ACTIVE when a changed copy is OFF but another copy still wants it', async () => {
      const offEvent = buildCalendarEvent({
        id: 'event-off',
        recordingPreference: 'OFF',
      });
      const onEvent = buildCalendarEvent({
        id: 'event-on',
        recordingPreference: 'ON',
      });

      mockCalendarEventRepository.find
        .mockResolvedValueOnce([offEvent])
        .mockResolvedValueOnce([offEvent, onEvent]);

      const aggregates = await service.evaluateMeetingOccurrences({
        workspaceId: 'workspace-1',
        calendarEventIds: ['event-off'],
      });

      expect(aggregates).toHaveLength(1);
      expect(aggregates[0].providerIntent).toBe('ACTIVE');
      expect(aggregates[0].activeCalendarEventIds).toEqual(['event-on']);
    });

    it('should cancel a meeting whose only calendar event was removed', async () => {
      mockCalendarEventRepository.find.mockResolvedValueOnce([]);

      const aggregates = await service.evaluateMeetingOccurrences({
        workspaceId: 'workspace-1',
        calendarEventIds: [],
        removedOccurrences: [
          { realMeetingKey: MEETING_KEY, startsAt: '2999-01-01T10:00:00.000Z' },
        ],
      });

      expect(aggregates).toEqual([
        {
          realMeetingKey: MEETING_KEY,
          providerIntent: 'CANCELED',
          calendarEventIds: [],
          activeCalendarEventIds: [],
        },
      ]);
    });

    it('should keep a meeting ACTIVE when one copy is removed but a surviving copy still wants it', async () => {
      const survivingOnEvent = buildCalendarEvent({
        id: 'event-on',
        recordingPreference: 'ON',
      });

      mockCalendarEventRepository.find.mockResolvedValueOnce([
        survivingOnEvent,
      ]);

      const aggregates = await service.evaluateMeetingOccurrences({
        workspaceId: 'workspace-1',
        calendarEventIds: [],
        removedOccurrences: [
          { realMeetingKey: MEETING_KEY, startsAt: '2999-01-01T10:00:00.000Z' },
        ],
      });

      expect(aggregates).toHaveLength(1);
      expect(aggregates[0].providerIntent).toBe('ACTIVE');
      expect(aggregates[0].activeCalendarEventIds).toEqual(['event-on']);
    });
  });
});
