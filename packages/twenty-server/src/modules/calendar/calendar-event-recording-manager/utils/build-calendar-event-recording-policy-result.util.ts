import { isDefined } from 'twenty-shared/utils';

import {
  CALENDAR_EVENT_RECORDING_PREFERENCES,
  type CalendarEventRecordingPreference,
} from 'src/engine/core-modules/calendar/types/calendar-event-recording-preference.type';
import { type CalendarEventRecordingPolicyResultForEvent } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-result-for-event.type';
import { computeRealMeetingKey } from 'src/modules/calendar/calendar-event-recording-manager/utils/compute-real-meeting-key.util';
import { resolveCalendarEventRecordingPolicyResult } from 'src/modules/calendar/calendar-event-recording-manager/utils/resolve-calendar-event-recording-policy-result.util';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

type BuildCalendarEventRecordingPolicyResultContext = {
  isRecordingEnabledForWorkspace: boolean;
  now: Date;
};

export const buildCalendarEventRecordingPolicyResult = (
  calendarEvent: CalendarEventWorkspaceEntity,
  {
    isRecordingEnabledForWorkspace,
    now,
  }: BuildCalendarEventRecordingPolicyResultContext,
): CalendarEventRecordingPolicyResultForEvent => {
  const conferenceLinkUrl =
    calendarEvent.conferenceLink?.primaryLinkUrl ?? null;

  const realMeetingKey = computeRealMeetingKey({
    calendarEventId: calendarEvent.id,
    conferenceLinkUrl,
    iCalUid: calendarEvent.iCalUid,
    startsAt: calendarEvent.startsAt,
  });

  const hasExternalParticipant = (
    calendarEvent.calendarEventParticipants ?? []
  ).some((participant) => !isDefined(participant.workspaceMemberId));
  const recordingPreference = normalizeCalendarEventRecordingPreference(
    calendarEvent.recordingPreference,
  );

  const policyResult = resolveCalendarEventRecordingPolicyResult({
    input: {
      recordingPreference,
      isCanceled: calendarEvent.isCanceled,
      startsAt: calendarEvent.startsAt,
      endsAt: calendarEvent.endsAt,
      conferenceLinkUrl,
      hasExternalParticipant,
    },
    now,
    isRecordingEnabledForWorkspace,
  });

  return {
    calendarEventId: calendarEvent.id,
    recordingPreference,
    realMeetingKey,
    ...policyResult,
  };
};

const normalizeCalendarEventRecordingPreference = (
  recordingPreference: string,
): CalendarEventRecordingPreference =>
  isCalendarEventRecordingPreference(recordingPreference)
    ? recordingPreference
    : 'AUTO';

const isCalendarEventRecordingPreference = (
  recordingPreference: string,
): recordingPreference is CalendarEventRecordingPreference =>
  CALENDAR_EVENT_RECORDING_PREFERENCES.some(
    (calendarEventRecordingPreference) =>
      calendarEventRecordingPreference === recordingPreference,
  );
