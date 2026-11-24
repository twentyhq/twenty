import { type CalendarEventRecurrenceParams } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-params.type';

export type ComposeCalendarEventParams = {
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  isFullDay?: boolean;
  timeZone?: string;
  attendees?: string;
  sendInvitations?: boolean;
  addConferencing?: boolean;
  connectedAccountId?: string;
  recurrence?: CalendarEventRecurrenceParams | null;
};
