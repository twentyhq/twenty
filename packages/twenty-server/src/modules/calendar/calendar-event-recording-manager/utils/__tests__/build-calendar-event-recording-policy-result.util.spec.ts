import { buildCalendarEventRecordingPolicyResult } from 'src/modules/calendar/calendar-event-recording-manager/utils/build-calendar-event-recording-policy-result.util';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

const NOW = new Date('2026-06-05T10:00:00.000Z');

const buildCalendarEvent = (
  overrides: Partial<CalendarEventWorkspaceEntity> = {},
): CalendarEventWorkspaceEntity => ({
  id: 'calendar-event-id',
  title: 'Customer call',
  description: '',
  isCanceled: false,
  isFullDay: false,
  startsAt: '2026-06-05T11:00:00.000Z',
  endsAt: '2026-06-05T12:00:00.000Z',
  location: '',
  conferenceLink: {
    primaryLinkLabel: 'Google Meet',
    primaryLinkUrl: 'https://meet.google.com/abc-defg-hij',
    secondaryLinks: null,
  },
  externalCreatedAt: '2026-06-01T10:00:00.000Z',
  externalUpdatedAt: '2026-06-01T10:00:00.000Z',
  deletedAt: null,
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
  iCalUid: 'ical-uid',
  conferenceSolution: 'googleMeet',
  recordingPreference: 'AUTO',
  calendarChannelEventAssociations: [],
  calendarEventParticipants: [
    {
      workspaceMemberId: null,
    } as CalendarEventParticipantWorkspaceEntity,
  ],
  ...overrides,
});

describe('buildCalendarEventRecordingPolicyResult', () => {
  it('should normalize unknown recording preferences to AUTO before resolving policy', () => {
    const result = buildCalendarEventRecordingPolicyResult(
      buildCalendarEvent({
        recordingPreference: 'SOMETHING_ELSE',
      }),
      {
        isRecordingEnabledForWorkspace: true,
        now: NOW,
      },
    );

    expect(result.recordingPreference).toBe('AUTO');
    expect(result.shouldRecord).toBe(true);
    expect(result.reason).toBe('AUTO_POLICY_MATCHED');
  });
});
