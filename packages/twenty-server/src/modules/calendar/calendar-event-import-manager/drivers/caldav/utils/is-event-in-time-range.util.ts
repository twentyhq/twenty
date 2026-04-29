import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const isEventInTimeRange = (
  event: FetchedCalendarEvent,
  windowStart: Date,
  windowEnd: Date,
): boolean => {
  if (!event.startsAt || !event.endsAt) return false;

  const eventStart = new Date(event.startsAt);
  const eventEnd = new Date(event.endsAt);

  return eventStart < windowEnd && eventEnd > windowStart;
};
