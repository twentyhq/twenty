import type * as ical from 'node-ical';

import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

export const mapPartStatToResponseStatus = (
  partStat: ical.AttendeePartStat,
): CalendarEventParticipantResponseStatus => {
  switch (partStat) {
    case 'ACCEPTED':
      return CalendarEventParticipantResponseStatus.ACCEPTED;
    case 'DECLINED':
      return CalendarEventParticipantResponseStatus.DECLINED;
    case 'TENTATIVE':
      return CalendarEventParticipantResponseStatus.TENTATIVE;
    case 'DELEGATED':
    case 'NEEDS-ACTION':
    default:
      return CalendarEventParticipantResponseStatus.NEEDS_ACTION;
  }
};
