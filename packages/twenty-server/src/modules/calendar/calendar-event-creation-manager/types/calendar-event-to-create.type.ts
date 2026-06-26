export type CalendarEventAttendeeToCreate = {
  email: string;
  displayName?: string;
};

export type CalendarEventToCreate = {
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  isFullDay: boolean;
  timeZone: string;
  attendees: CalendarEventAttendeeToCreate[];
  sendInvitations: boolean;
  addConferencing: boolean;
};
