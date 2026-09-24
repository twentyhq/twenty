import { type FetchedCalendarEventParticipant } from 'src/modules/calendar/common/types/fetched-calendar-event';

export type FetchedParticipantWithCalendarEventId =
  FetchedCalendarEventParticipant & {
    calendarEventId: string;
  };
