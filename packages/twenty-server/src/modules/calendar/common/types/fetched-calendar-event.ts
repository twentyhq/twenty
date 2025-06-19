export type FetchedCalendarEventParticipant = {
  id: string;
  name: string;
  email: string;
  status: string;
  handle: string;
};

export type FetchedCalendarEvent = {
  id: string;
  title: string;
  iCalUID: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  isFullDay: boolean;
  isCanceled: boolean;
  conferenceLinkLabel: string;
  conferenceLinkUrl: string;
  externalCreatedAt: string;
  externalUpdatedAt: string;
  conferenceSolution: string;
  recurringEventExternalId?: string;
  participants: FetchedCalendarEventParticipant[];
  status: string;
};
