import { isDefined } from 'twenty-shared/utils';

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

  const policyResult = resolveCalendarEventRecordingPolicyResult({
    input: {
      recordingPreference: calendarEvent.recordingPreference,
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
    recordingPreference: calendarEvent.recordingPreference,
    realMeetingKey,
    ...policyResult,
  };
};
