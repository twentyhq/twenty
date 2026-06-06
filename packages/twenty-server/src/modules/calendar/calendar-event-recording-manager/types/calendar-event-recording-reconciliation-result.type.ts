type CalendarEventRecordingReconciliationAction =
  | 'CREATED'
  | 'UPDATED'
  | 'CANCELED'
  | 'SKIPPED';

export type CalendarEventRecordingReconciliationResult = {
  action: CalendarEventRecordingReconciliationAction;
  realMeetingKey: string;
  callRecordingId: string | null;
};
