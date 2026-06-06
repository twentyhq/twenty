import { isDefined } from 'twenty-shared/utils';

import { type CalendarEventRecordingPolicyInput } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-input.type';
import { type CalendarEventRecordingPolicyNotRequiredReason } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-not-required-reason.type';
import { type CalendarEventRecordingPolicyRequiredReason } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-required-reason.type';
import { type CalendarEventRecordingPolicyResult } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-result.type';

type ResolveCalendarEventRecordingPolicyResultArgs = {
  input: CalendarEventRecordingPolicyInput;
  now: Date;
  isRecordingEnabledForWorkspace: boolean;
};

export const resolveCalendarEventRecordingPolicyResult = ({
  input,
  now,
  isRecordingEnabledForWorkspace,
}: ResolveCalendarEventRecordingPolicyResultArgs): CalendarEventRecordingPolicyResult => {
  if (!isRecordingEnabledForWorkspace) {
    return recordingNotRequired('WORKSPACE_RECORDING_DISABLED');
  }

  if (input.isCanceled) {
    return recordingNotRequired('EVENT_CANCELED');
  }

  if (input.recordingPreference === 'OFF') {
    return recordingNotRequired('PREFERENCE_OFF');
  }

  if (input.recordingPreference === 'ON') {
    if (
      !isCalendarEventInFuture({
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        now,
      })
    ) {
      return recordingNotRequired('PREFERENCE_ON_EVENT_NOT_UPCOMING');
    }

    return recordingRequired('PREFERENCE_ON');
  }

  if (
    !isDefined(input.conferenceLinkUrl) ||
    input.conferenceLinkUrl.trim() === ''
  ) {
    return recordingNotRequired('AUTO_MISSING_CONFERENCE_LINK');
  }

  if (
    !isCalendarEventInFuture({
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      now,
    })
  ) {
    return recordingNotRequired('AUTO_EVENT_NOT_UPCOMING');
  }

  if (!input.hasExternalParticipant) {
    return recordingNotRequired('AUTO_NO_EXTERNAL_PARTICIPANT');
  }

  return recordingRequired('AUTO_POLICY_MATCHED');
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

const recordingRequired = (
  reason: CalendarEventRecordingPolicyRequiredReason,
): CalendarEventRecordingPolicyResult => ({ shouldRecord: true, reason });

const recordingNotRequired = (
  reason: CalendarEventRecordingPolicyNotRequiredReason,
): CalendarEventRecordingPolicyResult => ({ shouldRecord: false, reason });
