import { isDefined } from 'twenty-shared/utils';

import { type CalendarEventRecordingDecisionReason } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision-reason.type';
import { type CalendarEventRecordingDecision } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision.type';
import { type CalendarEventRecordingPolicyInput } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-input.type';

type EvaluateCalendarEventRecordingDecisionArgs = {
  input: CalendarEventRecordingPolicyInput;
  now: Date;
  isRecordingEnabledForWorkspace: boolean;
};

export const evaluateCalendarEventRecordingDecision = ({
  input,
  now,
  isRecordingEnabledForWorkspace,
}: EvaluateCalendarEventRecordingDecisionArgs): CalendarEventRecordingDecision => {
  if (!isRecordingEnabledForWorkspace) {
    return cancel('WORKSPACE_RECORDING_DISABLED');
  }

  if (input.isCanceled) {
    return cancel('EVENT_CANCELED');
  }

  if (input.recordingPreference === 'OFF') {
    return cancel('PREFERENCE_OFF');
  }

  if (input.recordingPreference === 'ON') {
    return active('PREFERENCE_ON');
  }

  // AUTO (default): narrow external-meetings policy. Every condition must hold.
  if (
    !isDefined(input.conferenceLinkUrl) ||
    input.conferenceLinkUrl.trim() === ''
  ) {
    return cancel('AUTO_MISSING_CONFERENCE_LINK');
  }

  if (
    !isCalendarEventInFuture({
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      now,
    })
  ) {
    return cancel('AUTO_EVENT_NOT_UPCOMING');
  }

  if (!input.hasExternalParticipant) {
    return cancel('AUTO_NO_EXTERNAL_PARTICIPANT');
  }

  return active('AUTO_POLICY_MATCHED');
};

const isCalendarEventInFuture = ({
  startsAt,
  endsAt,
  now,
}: {
  startsAt: string | null;
  endsAt: string | null;
  now: Date;
}): boolean => {
  // Prefer the end time so an in-progress meeting is still eligible; fall back to start.
  const reference = endsAt ?? startsAt;

  if (!isDefined(reference) || reference === '') {
    return false;
  }

  const referenceTime = new Date(reference).getTime();

  if (Number.isNaN(referenceTime)) {
    return false;
  }

  return referenceTime > now.getTime();
};

const active = (
  reason: CalendarEventRecordingDecisionReason,
): CalendarEventRecordingDecision => ({ eventIntent: 'ACTIVE', reason });

const cancel = (
  reason: CalendarEventRecordingDecisionReason,
): CalendarEventRecordingDecision => ({ eventIntent: 'CANCELED', reason });
