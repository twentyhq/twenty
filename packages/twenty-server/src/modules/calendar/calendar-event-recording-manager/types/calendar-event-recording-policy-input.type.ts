// Decoupled from the workspace entity so the policy stays a pure, unit-testable function.
export type CalendarEventRecordingPolicyInput = {
  recordingPreference: string;
  isCanceled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  conferenceLinkUrl: string | null;
  hasExternalParticipant: boolean;
};
