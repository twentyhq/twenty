import { CalendarEventRecordingPolicyJob } from 'src/modules/calendar/calendar-event-recording-manager/jobs/calendar-event-recording-policy.job';
import { CalendarEventRecordingListener } from 'src/modules/calendar/calendar-event-recording-manager/listeners/calendar-event-recording.listener';

const mockMessageQueueService = {
  add: jest.fn(),
};

const OLD_CALENDAR_EVENT = {
  id: 'event-1',
  conferenceLink: {
    primaryLinkUrl: 'https://meet.google.com/abc-defg-hij',
  },
  iCalUid: 'ical-1',
  startsAt: '2999-01-01T10:00:00.000Z',
};

const buildUpdatePayload = (updatedFields: string[]) =>
  ({
    workspaceId: 'workspace-1',
    events: [
      {
        recordId: 'event-1',
        properties: { updatedFields, before: OLD_CALENDAR_EVENT },
      },
    ],
  }) as any;

describe('CalendarEventRecordingListener', () => {
  let listener: CalendarEventRecordingListener;

  beforeEach(() => {
    jest.clearAllMocks();
    listener = new CalendarEventRecordingListener(
      mockMessageQueueService as any,
    );
  });

  it('should enqueue a policy check when a recording-relevant field changed', async () => {
    await listener.handleUpdatedEvent(
      buildUpdatePayload(['recordingPreference']),
    );

    expect(mockMessageQueueService.add).toHaveBeenCalledWith(
      CalendarEventRecordingPolicyJob.name,
      {
        workspaceId: 'workspace-1',
        calendarEventIds: ['event-1'],
        removedOccurrences: [],
      },
    );
  });

  it('should enqueue the current event and previous occurrence when the meeting key changed', async () => {
    await listener.handleUpdatedEvent(buildUpdatePayload(['conferenceLink']));

    expect(mockMessageQueueService.add).toHaveBeenCalledWith(
      CalendarEventRecordingPolicyJob.name,
      {
        workspaceId: 'workspace-1',
        calendarEventIds: ['event-1'],
        removedOccurrences: [
          {
            calendarEventId: 'event-1',
            realMeetingKey:
              'link:meet.google.com/abc-defg-hij:2999-01-01T10:00:00.000Z',
            startsAt: '2999-01-01T10:00:00.000Z',
          },
        ],
      },
    );
  });

  it('should enqueue a policy check when the title changed', async () => {
    await listener.handleUpdatedEvent(buildUpdatePayload(['title']));

    expect(mockMessageQueueService.add).toHaveBeenCalledWith(
      CalendarEventRecordingPolicyJob.name,
      {
        workspaceId: 'workspace-1',
        calendarEventIds: ['event-1'],
        removedOccurrences: [],
      },
    );
  });

  it('should not enqueue when only an irrelevant field changed', async () => {
    await listener.handleUpdatedEvent(buildUpdatePayload(['description']));

    expect(mockMessageQueueService.add).not.toHaveBeenCalled();
  });

  it('should enqueue a removed occurrence (key + start) when a calendar event is destroyed', async () => {
    await listener.handleDestroyedEvent({
      workspaceId: 'workspace-1',
      events: [
        {
          properties: {
            before: {
              id: 'event-1',
              conferenceLink: {
                primaryLinkUrl: 'https://meet.google.com/abc-defg-hij',
              },
              iCalUid: 'ical-1',
              startsAt: '2999-01-01T10:00:00.000Z',
            },
          },
        },
      ],
    } as any);

    expect(mockMessageQueueService.add).toHaveBeenCalledWith(
      CalendarEventRecordingPolicyJob.name,
      {
        workspaceId: 'workspace-1',
        calendarEventIds: [],
        removedOccurrences: [
          {
            calendarEventId: 'event-1',
            realMeetingKey:
              'link:meet.google.com/abc-defg-hij:2999-01-01T10:00:00.000Z',
            startsAt: '2999-01-01T10:00:00.000Z',
          },
        ],
      },
    );
  });
});
