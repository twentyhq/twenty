import { Injectable, Logger } from '@nestjs/common';

import * as ical from 'node-ical';
import {
  createAccount,
  DAVAccount,
  DAVCalendar,
  DAVObject,
  fetchCalendarObjects,
  fetchCalendars,
  getBasicAuthHeaders,
} from 'tsdav';

import { CalDavGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-get-events.service';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import {
  FetchedCalendarEvent,
  FetchedCalendarEventParticipant,
} from 'src/modules/calendar/common/types/fetched-calendar-event';

const DEFAULT_CALENDAR_TYPE = 'caldav';

interface CalendarCredentials {
  username: string;
  password: string;
  serverUrl: string;
}

interface SimpleCalendar {
  id: string;
  name: string;
  url: string;
  isPrimary?: boolean;
}

interface FetchEventsOptions {
  calendars: SimpleCalendar[];
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class CalDAVClient {
  private credentials: CalendarCredentials;
  private logger: Logger;
  private headers: Record<string, string>;

  constructor(credentials: CalendarCredentials) {
    this.credentials = credentials;
    this.logger = new Logger(CalDAVClient.name);
    this.headers = getBasicAuthHeaders({
      username: credentials.username,
      password: credentials.password,
    });
  }

  private hasFileExtension(url: string): boolean {
    const fileName = url.substring(url.lastIndexOf('/') + 1);

    return (
      fileName.includes('.') &&
      !fileName.substring(fileName.lastIndexOf('.')).includes('/')
    );
  }

  private getFileExtension(url: string): string {
    if (!this.hasFileExtension(url)) return 'ics';
    const fileName = url.substring(url.lastIndexOf('/') + 1);

    return fileName.substring(fileName.lastIndexOf('.') + 1);
  }

  private isValidFormat(url: string): boolean {
    const allowedExtensions = ['eml', 'ics'];
    const urlExtension = this.getFileExtension(url);

    if (!allowedExtensions.includes(urlExtension)) {
      return false;
    }

    return true;
  }

  private async getAccount(): Promise<DAVAccount> {
    return createAccount({
      account: {
        serverUrl: this.credentials.serverUrl,
        accountType: DEFAULT_CALENDAR_TYPE,
        credentials: {
          username: this.credentials.username,
          password: this.credentials.password,
        },
      },
      headers: this.headers,
    });
  }

  async listCalendars(): Promise<SimpleCalendar[]> {
    try {
      const account = await this.getAccount();

      const calendars = (await fetchCalendars({
        account,
        headers: this.headers,
      })) as (Omit<DAVCalendar, 'displayName'> & {
        displayName?: string | Record<string, unknown>;
      })[];

      return calendars.reduce<SimpleCalendar[]>((result, calendar) => {
        if (!calendar.components?.includes('VEVENT')) return result;

        result.push({
          id: calendar.url,
          url: calendar.url,
          name:
            typeof calendar.displayName === 'string'
              ? calendar.displayName
              : 'Unnamed Calendar',
          isPrimary: false,
        });

        return result;
      }, []);
    } catch (error) {
      this.logger.error(
        `Error in ${CalDavGetEventsService.name} - getCalendarEvents`,
        error.code,
        error,
      );

      throw error;
    }
  }

  private async fetchCalendarObjects(
    calendars: SimpleCalendar[],
    startDate: Date,
    endDate: Date,
  ): Promise<DAVObject[]> {
    const filteredCalendars = calendars.filter((calendar) => calendar.url);

    const fetchPromises = filteredCalendars.map(async (calendar) => {
      const response = await fetchCalendarObjects({
        urlFilter: (url) => this.isValidFormat(url),
        calendar: {
          url: calendar.url,
        },
        headers: this.headers,
        expand: true,
        timeRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });

      const processedResponse = await Promise.all(
        response.map(async (calendarObject) => {
          const hasEtag = calendarObject.etag !== undefined;
          const dataUndefined = calendarObject.data === undefined;

          if (dataUndefined && hasEtag) {
            const responseWithoutExpand = await fetchCalendarObjects({
              urlFilter: (url) => this.isValidFormat(url),
              calendar: {
                url: calendar.url,
              },
              headers: this.headers,
              expand: false,
              timeRange: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
              },
            });

            return responseWithoutExpand.find(
              (obj) =>
                obj.url === calendarObject.url &&
                obj.etag === calendarObject.etag,
            );
          }

          return calendarObject;
        }),
      );

      return processedResponse;
    });

    const resolvedPromises = await Promise.allSettled(fetchPromises);
    const fulfilledPromises = resolvedPromises.filter(
      (promise): promise is PromiseFulfilledResult<(DAVObject | undefined)[]> =>
        promise.status === 'fulfilled',
    );

    return fulfilledPromises
      .map((promise) => promise.value)
      .flat()
      .filter((obj) => obj !== null) as DAVObject[];
  }

  /**
   * Determines if an event is a full-day event by checking the raw iCal data.
   * Full-day events use VALUE=DATE parameter in DTSTART/DTEND properties.
   * Since node-ical converts all dates to JavaScript Date objects, we must check the raw data.
   * @see https://tools.ietf.org/html/rfc5545#section-3.3.4 (DATE Value Type)
   * @see https://tools.ietf.org/html/rfc5545#section-3.3.5 (DATE-TIME Value Type)
   * @see https://tools.ietf.org/html/rfc5545#section-3.2.20 (VALUE Parameter)
   */
  private isFullDayEvent(rawICalData: string): boolean {
    const lines = rawICalData.split(/\r?\n/);

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (
        trimmedLine.startsWith('DTSTART') &&
        trimmedLine.includes('VALUE=DATE')
      ) {
        return true;
      }
    }

    return false;
  }

  private extractOrganizerFromEvent(
    event: ical.VEvent,
  ): FetchedCalendarEventParticipant | null {
    if (!event.organizer) {
      return null;
    }

    const organizerEmail =
      // @ts-expect-error - limitation of node-ical typing
      event.organizer.val?.replace(/^mailto:/i, '') || '';

    return {
      displayName:
        // @ts-expect-error - limitation of node-ical typing
        event.organizer.params?.CN || organizerEmail || 'Unknown',
      responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
      handle: organizerEmail,
      isOrganizer: true,
    };
  }

  private mapPartStatToResponseStatus(
    partStat: ical.AttendeePartStat,
  ): CalendarEventParticipantResponseStatus {
    switch (partStat) {
      case 'ACCEPTED':
        return CalendarEventParticipantResponseStatus.ACCEPTED;
      case 'DECLINED':
        return CalendarEventParticipantResponseStatus.DECLINED;
      case 'TENTATIVE':
        return CalendarEventParticipantResponseStatus.TENTATIVE;
      case 'NEEDS-ACTION':
      default:
        return CalendarEventParticipantResponseStatus.NEEDS_ACTION;
    }
  }

  private extractAttendeesFromEvent(
    event: ical.VEvent,
  ): FetchedCalendarEventParticipant[] {
    if (!event.attendee) {
      return [];
    }

    const attendees = Array.isArray(event.attendee)
      ? event.attendee
      : [event.attendee];

    return attendees.map((attendee: ical.Attendee) => {
      // @ts-expect-error - limitation of node-ical typing
      const handle = attendee.val?.replace(/^mailto:/i, '') || '';
      // @ts-expect-error - limitation of node-ical typing
      const displayName = attendee.params?.CN || handle || 'Unknown';
      // @ts-expect-error - limitation of node-ical typing
      const partStat = attendee.params?.PARTSTAT || 'NEEDS_ACTION';

      return {
        displayName,
        responseStatus: this.mapPartStatToResponseStatus(partStat),
        handle,
        isOrganizer: false,
      };
    });
  }

  private extractParticipantsFromEvent(
    event: ical.VEvent,
  ): FetchedCalendarEventParticipant[] {
    const participants: FetchedCalendarEventParticipant[] = [];

    const organizer = this.extractOrganizerFromEvent(event);

    if (organizer) {
      participants.push(organizer);
    }

    const attendees = this.extractAttendeesFromEvent(event);

    participants.push(...attendees);

    return participants;
  }

  private parseICalData(
    rawData: string,
    objectUrl: string,
  ): FetchedCalendarEvent | null {
    try {
      const parsed = ical.parseICS(rawData);
      const events = Object.values(parsed).filter(
        (item) => item.type === 'VEVENT',
      );

      if (events.length === 0) {
        return null;
      }

      const event = events[0] as ical.VEvent;
      const participants = this.extractParticipantsFromEvent(event);

      return {
        id: objectUrl,
        title: event.summary || 'Untitled Event',
        iCalUID: event.uid || '',
        description: event.description || '',
        startsAt: event.start.toISOString(),
        endsAt: event.end.toISOString(),
        location: event.location || '',
        isFullDay: this.isFullDayEvent(rawData),
        isCanceled: event.status === 'CANCELLED',
        conferenceLinkLabel: '',
        conferenceLinkUrl: event.url,
        externalCreatedAt: event.created.toISOString(),
        externalUpdatedAt: event.lastmodified.toISOString(),
        conferenceSolution: '',
        recurringEventExternalId: event.recurrenceid
          ? String(event.recurrenceid)
          : undefined,
        participants,
        status: event.status || 'CONFIRMED',
      };
    } catch (error) {
      this.logger.error(
        `Error in ${CalDavGetEventsService.name} - parseICalData`,
        error,
      );

      return null;
    }
  }

  async getEvents(
    options: FetchEventsOptions,
  ): Promise<FetchedCalendarEvent[]> {
    try {
      const davObjects = await this.fetchCalendarObjects(
        options.calendars,
        options.startDate,
        options.endDate,
      );

      const events = davObjects
        .filter((obj) => typeof obj !== 'undefined' && obj.data)
        .map((obj) => this.parseICalData(obj.data, obj.url))
        .filter((event): event is FetchedCalendarEvent => event !== null);

      return events;
    } catch (error) {
      this.logger.error(
        `Error in ${CalDavGetEventsService.name} - getCalendarEvents`,
        error.code,
        error,
      );

      throw error;
    }
  }

  async getAllEvents(
    startDate: Date,
    endDate: Date,
  ): Promise<FetchedCalendarEvent[]> {
    const calendars = await this.listCalendars();

    return this.getEvents({
      calendars,
      startDate,
      endDate,
    });
  }
}
