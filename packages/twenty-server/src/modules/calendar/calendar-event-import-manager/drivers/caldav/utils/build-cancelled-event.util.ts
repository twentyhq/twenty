import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const buildCancelledCalDavEvent = (
  href: string,
): FetchedCalendarEvent => ({
  id: href,
  title: '',
  iCalUid: '',
  description: '',
  startsAt: '',
  endsAt: '',
  location: '',
  isFullDay: false,
  isCanceled: true,
  conferenceLinkLabel: '',
  conferenceLinkUrl: '',
  externalCreatedAt: '',
  externalUpdatedAt: '',
  conferenceSolution: '',
  participants: [],
  status: 'CANCELLED',
});
