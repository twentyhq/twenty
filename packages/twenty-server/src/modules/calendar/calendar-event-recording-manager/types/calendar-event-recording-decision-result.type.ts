import { type CalendarEventRecordingDecision } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision.type';

type FoundCalendarEventRecordingDecisionResult =
  CalendarEventRecordingDecision & {
    workspaceId: string;
    calendarEventId: string;
    found: true;
    recordingPreference: string;
    realMeetingKey: string;
  };

type NotFoundCalendarEventRecordingDecisionResult = {
  workspaceId: string;
  calendarEventId: string;
  found: false;
  recordingPreference: null;
  realMeetingKey: null;
  eventIntent: null;
  reason: null;
};

export type CalendarEventRecordingDecisionResult =
  | FoundCalendarEventRecordingDecisionResult
  | NotFoundCalendarEventRecordingDecisionResult;
