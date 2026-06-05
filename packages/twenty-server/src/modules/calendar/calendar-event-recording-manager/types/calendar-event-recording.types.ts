// Per-event recording intent, and the aggregate intent computed in code across every calendar
// event that resolves to the same real meeting. Nothing here is persisted: the provider-dispatch
// PR owns the idempotent bot upsert keyed by realMeetingKey.
export type CalendarEventRecordingIntent = 'ACTIVE' | 'CANCELED';

export type CalendarEventRecordingDecisionReason =
  | 'WORKSPACE_RECORDING_DISABLED'
  | 'EVENT_CANCELED'
  | 'PREFERENCE_OFF'
  | 'PREFERENCE_ON'
  | 'AUTO_POLICY_MATCHED'
  | 'AUTO_MISSING_CONFERENCE_LINK'
  | 'AUTO_EVENT_NOT_UPCOMING'
  | 'AUTO_NO_EXTERNAL_PARTICIPANT';

// Decoupled from the workspace entity so the policy stays a pure, unit-testable function.
export type CalendarEventRecordingPolicyInput = {
  recordingPreference: string;
  isCanceled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  conferenceLinkUrl: string | null;
  hasExternalParticipant: boolean;
};

export type CalendarEventRecordingDecision = {
  eventIntent: CalendarEventRecordingIntent;
  reason: CalendarEventRecordingDecisionReason;
};

export type CalendarEventRecordingDecisionResult = {
  workspaceId: string;
  calendarEventId: string;
  found: boolean;
  recordingPreference: string | null;
  realMeetingKey: string | null;
  eventIntent: CalendarEventRecordingIntent | null;
  reason: CalendarEventRecordingDecisionReason | null;
};
