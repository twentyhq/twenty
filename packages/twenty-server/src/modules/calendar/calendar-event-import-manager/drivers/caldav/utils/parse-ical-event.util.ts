import * as ical from 'node-ical';
import { icalDataExtractPropertyValue } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/utils/icalDataExtractPropertyValue';
import { extractAttendeesFromEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-attendees-from-event.util';
import { extractOrganizerFromEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-organizer-from-event.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const parseICalEvents = (
  rawData: string,
  objectUrl: string,
): FetchedCalendarEvent[] => {
  try {
    const events = Object.values(ical.parseICS(rawData))
      .filter(
        (calendarComponent): calendarComponent is ical.VEvent =>
          calendarComponent.type === 'VEVENT',
      )
      .flatMap((event) => [event, ...Object.values(event.recurrences ?? {})])
      .filter(
        (event) => event.start instanceof Date && event.end instanceof Date,
      );

    return events.map((event) => {
      const organizer = extractOrganizerFromEvent(event);
      const attendees = extractAttendeesFromEvent(event);
      const recurrenceIso =
        event.recurrenceid instanceof Date
          ? event.recurrenceid.toISOString()
          : undefined;
      const createdIso =
        event.created?.toISOString() ?? new Date().toISOString();

      return {
        id: recurrenceIso
          ? `${objectUrl}#recurrence=${recurrenceIso}`
          : objectUrl,
        iCalUid: event.uid || '',
        title: icalDataExtractPropertyValue(event.summary, 'Untitled Event'),
        description: icalDataExtractPropertyValue(event.description),
        location: icalDataExtractPropertyValue(event.location),
        startsAt: event.start.toISOString(),
        endsAt: event.end.toISOString(),
        isFullDay: event.datetype === 'date',
        isCanceled: event.status === 'CANCELLED',
        status: event.status || 'CONFIRMED',
        recurringEventExternalId: recurrenceIso,
        conferenceLinkLabel: '',
        conferenceLinkUrl: icalDataExtractPropertyValue(event.url),
        conferenceSolution: '',
        externalCreatedAt: createdIso,
        externalUpdatedAt: event.lastmodified?.toISOString() ?? createdIso,
        participants: organizer ? [organizer, ...attendees] : attendees,
      };
    });
  } catch {
    return [];
  }
};
