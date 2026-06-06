import { CalendarEventRecordingPolicyJob } from 'src/modules/calendar/calendar-event-recording-manager/jobs/calendar-event-recording-policy.job';
import { CalendarEventRecordingParticipantListener } from 'src/modules/calendar/calendar-event-recording-manager/listeners/calendar-event-recording-participant.listener';

const mockMessageQueueService = {
  add: jest.fn(),
};

describe('CalendarEventRecordingParticipantListener', () => {
  let listener: CalendarEventRecordingParticipantListener;

  beforeEach(() => {
    jest.clearAllMocks();
    listener = new CalendarEventRecordingParticipantListener(
      mockMessageQueueService as any,
    );
  });

  it('should re-check the parent calendar event when a participant is created', async () => {
    await listener.handleCreatedEvent({
      workspaceId: 'workspace-1',
      events: [{ properties: { after: { calendarEventId: 'event-1' } } }],
    } as any);

    expect(mockMessageQueueService.add).toHaveBeenCalledWith(
      CalendarEventRecordingPolicyJob.name,
      {
        workspaceId: 'workspace-1',
        calendarEventIds: ['event-1'],
        removedOccurrences: [],
      },
    );
  });

  it('should re-check only when a participant workspace member relation changed', async () => {
    await listener.handleUpdatedEvent({
      workspaceId: 'workspace-1',
      events: [
        {
          properties: {
            updatedFields: ['workspaceMember'],
            after: { calendarEventId: 'event-1' },
          },
        },
        {
          properties: {
            updatedFields: ['responseStatus'],
            after: { calendarEventId: 'event-2' },
          },
        },
      ],
    } as any);

    expect(mockMessageQueueService.add).toHaveBeenCalledWith(
      CalendarEventRecordingPolicyJob.name,
      {
        workspaceId: 'workspace-1',
        calendarEventIds: ['event-1'],
        removedOccurrences: [],
      },
    );
  });

  it('should not enqueue when no participant changed the workspace member match', async () => {
    await listener.handleUpdatedEvent({
      workspaceId: 'workspace-1',
      events: [
        {
          properties: {
            updatedFields: ['responseStatus'],
            after: { calendarEventId: 'event-1' },
          },
        },
      ],
    } as any);

    expect(mockMessageQueueService.add).not.toHaveBeenCalled();
  });

  it('should re-check the parent calendar event when a participant is destroyed', async () => {
    await listener.handleDestroyedEvent({
      workspaceId: 'workspace-1',
      events: [{ properties: { before: { calendarEventId: 'event-1' } } }],
    } as any);

    expect(mockMessageQueueService.add).toHaveBeenCalledWith(
      CalendarEventRecordingPolicyJob.name,
      {
        workspaceId: 'workspace-1',
        calendarEventIds: ['event-1'],
        removedOccurrences: [],
      },
    );
  });
});
