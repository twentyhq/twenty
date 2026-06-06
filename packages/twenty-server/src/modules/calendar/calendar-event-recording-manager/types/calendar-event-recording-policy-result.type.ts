import { type CalendarEventRecordingPolicyNotRequiredReason } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-not-required-reason.type';
import { type CalendarEventRecordingPolicyRequiredReason } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-required-reason.type';

export type CalendarEventRecordingPolicyResult =
  | {
      shouldRecord: true;
      reason: CalendarEventRecordingPolicyRequiredReason;
    }
  | {
      shouldRecord: false;
      reason: CalendarEventRecordingPolicyNotRequiredReason;
    };
