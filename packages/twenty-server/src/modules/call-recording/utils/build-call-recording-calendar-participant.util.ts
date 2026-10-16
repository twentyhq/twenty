import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CallRecordingRequestStatus } from 'src/modules/call-recording/common/enums/call-recording-request-status.enum';
import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

export const buildCallRecordingCalendarParticipant = (
  callRecording: CallRecordingWorkspaceEntity,
  applicationName: string,
) => {
  if (
    !isDefined(callRecording.calendarEventId) ||
    !isDefined(callRecording.applicationId) ||
    !isNonEmptyString(callRecording.externalBotId?.trim()) ||
    callRecording.recordingRequestStatus ===
      CallRecordingRequestStatus.CANCELED ||
    callRecording.status === CallRecordingStatus.NOT_RECORDED
  ) {
    return undefined;
  }

  return {
    callRecordingId: callRecording.id,
    calendarEventId: callRecording.calendarEventId,
    applicationId: callRecording.applicationId,
    handle: applicationName,
    displayName: applicationName,
    isOrganizer: false,
    responseStatus:
      callRecording.status === CallRecordingStatus.FAILED
        ? CalendarEventParticipantResponseStatus.DECLINED
        : CalendarEventParticipantResponseStatus.ACCEPTED,
    personId: null,
    workspaceMemberId: null,
    deletedAt: null,
  };
};
