import { type Event } from '@microsoft/microsoft-graph-types';

import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';

// Microsoft Graph interprets `dateTime` as a wall-clock time in the supplied
// `timeZone` and ignores any embedded offset, so an absolute instant must be
// converted to its wall-clock representation in the event time zone.
const toWallClockInTimeZone = (
  isoInstant: string,
  timeZone: string,
): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(isoInstant));

  const part = (type: string) =>
    parts.find((candidate) => candidate.type === type)?.value ?? '00';

  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}`;
};

// All-day events are timezone-agnostic dates pinned to midnight; timed events are
// absolute instants expressed as wall-clock in the event time zone.
const toMicrosoftEventDateTime = (
  isoDateTime: string,
  isFullDay: boolean,
  timeZone: string,
) => ({
  dateTime: isFullDay
    ? `${isoDateTime.slice(0, 10)}T00:00:00`
    : toWallClockInTimeZone(isoDateTime, timeZone),
  timeZone,
});

export const toMicrosoftEventInput = (input: CalendarEventToCreate): Event => {
  const event: Event = {
    subject: input.title,
    body: { contentType: 'text', content: input.description ?? '' },
    start: toMicrosoftEventDateTime(
      input.startsAt,
      input.isFullDay,
      input.timeZone,
    ),
    end: toMicrosoftEventDateTime(
      input.endsAt,
      input.isFullDay,
      input.timeZone,
    ),
    isAllDay: input.isFullDay,
  };

  if (input.location) {
    event.location = { displayName: input.location };
  }

  if (input.attendees.length > 0) {
    event.attendees = input.attendees.map((attendee) => ({
      emailAddress: { address: attendee.email, name: attendee.displayName },
      type: 'required',
    }));
  }

  if (input.addConferencing) {
    event.isOnlineMeeting = true;
    event.onlineMeetingProvider = 'teamsForBusiness';
  }

  return event;
};
