import { isDefined } from 'twenty-shared/utils';

import { type CalendarEventRecordingDecisionForEvent } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision-for-event.type';
import { computeRealMeetingKey } from 'src/modules/calendar/calendar-event-recording-manager/utils/compute-real-meeting-key.util';
import { evaluateCalendarEventRecordingDecision } from 'src/modules/calendar/calendar-event-recording-manager/utils/evaluate-calendar-event-recording-decision.util';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

type BuildCalendarEventRecordingDecisionContext = {
  isRecordingEnabledForWorkspace: boolean;
  now: Date;
};

export const buildCalendarEventRecordingDecision = (
  calendarEvent: CalendarEventWorkspaceEntity,
  {
    isRecordingEnabledForWorkspace,
    now,
  }: BuildCalendarEventRecordingDecisionContext,
): CalendarEventRecordingDecisionForEvent => {
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

  const { eventIntent, reason } = evaluateCalendarEventRecordingDecision({
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
    eventIntent,
    reason,
    startsAt: calendarEvent.startsAt,
  };
};
