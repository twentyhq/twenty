import { type CalendarEventRecordingPreference } from 'src/engine/core-modules/calendar/types/calendar-event-recording-preference.type';

export type CalendarEventRecordingPolicyInput = {
  recordingPreference: CalendarEventRecordingPreference;
  isCanceled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  conferenceLinkUrl: string | null;
  hasExternalParticipant: boolean;
};
