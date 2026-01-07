import { Injectable, Logger } from '@nestjs/common';

import * as ical from 'node-ical';
import {
  calendarMultiGet,
  createAccount,
  type DAVAccount,
  type DAVCalendar,
  DAVNamespaceShort,
  type DAVObject,
  fetchCalendars,
  getBasicAuthHeaders,
  syncCollection,
} from 'tsdav';

import { icalDataExtractPropertyValue } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/utils/icalDataExtractPropertyValue';
import { CalDavGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-get-events.service';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import {
  type FetchedCalendarEvent,
  type FetchedCalendarEventParticipant,
} from 'src/modules/calendar/common/types/fetched-calendar-event';

const DEFAULT_CALENDAR_TYPE = 'caldav';

type CalendarCredentials = {
  username: string;
  password: string;
  serverUrl: string;
};

type SimpleCalendar = {
  id: string;
  name: string;
  url: string;
  isPrimary?: boolean;
  syncToken?: string | number;
};

type FetchEventsOptions = {
  startDate: Date;
  endDate: Date;
  syncCursor?: CalDAVSyncCursor;
};

type CalDAVSyncResult = {
  events: FetchedCalendarEvent[];
  newSyncToken?: string;
};

type CalDAVSyncCursor = {
  syncTokens: Record<string, string>;
};

type CalDAVGetEventsResponse = {
  events: FetchedCalendarEvent[];
  syncCursor: CalDAVSyncCursor;
};

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

    return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
  }

  private isValidFormat(url: string): boolean {
    const allowedExtensions = ['eml', 'ics'];

    return allowedExtensions.includes(this.getFileExtension(url));
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

      const title = icalDataExtractPropertyValue(
        event.summary,
        'Untitled Event',
      );
      const description = icalDataExtractPropertyValue(event.description);
      const location = icalDataExtractPropertyValue(event.location);
      const conferenceLinkUrl = icalDataExtractPropertyValue(event.url);

      return {
        id: objectUrl,
        title,
        iCalUid: event.uid || '',
        description,
        startsAt: event.start.toISOString(),
        endsAt: event.end.toISOString(),
        location,
        isFullDay: this.isFullDayEvent(rawData),
        isCanceled: event.status === 'CANCELLED',
        conferenceLinkLabel: '',
        conferenceLinkUrl,
        externalCreatedAt:
          event.created?.toISOString() || new Date().toISOString(),
        externalUpdatedAt:
          event.lastmodified?.toISOString() ||
          event.created?.toISOString() ||
          new Date().toISOString(),
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
  ): Promise<CalDAVGetEventsResponse> {
    const calendars = await this.listCalendars();
    const results = new Map<string, CalDAVSyncResult>();

    const syncPromises = calendars.map(async (calendar) => {
      try {
        const syncToken =
          options.syncCursor?.syncTokens[calendar.url] ||
          calendar.syncToken?.toString();

        const syncResult = await syncCollection({
          url: calendar.url,
          props: {
            [`${DAVNamespaceShort.DAV}:getetag`]: {},
            [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {},
          },
          syncLevel: 1,
          ...(syncToken ? { syncToken } : {}),
          headers: this.headers,
        });

        const allEvents: FetchedCalendarEvent[] = [];

        const objectUrls = syncResult
          .map((event) => event.href)
          .filter((href): href is string => !!href && this.isValidFormat(href));

        if (objectUrls.length > 0) {
          try {
            const calendarObjects = await calendarMultiGet({
              url: calendar.url,
              props: {
                [`${DAVNamespaceShort.DAV}:getetag`]: {},
                [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {},
              },
              objectUrls: objectUrls,
              depth: '1',
              headers: this.headers,
            });

            for (const calendarObject of calendarObjects) {
              if (calendarObject.props?.calendarData) {
                const iCalData = this.extractICalData(
                  calendarObject.props?.calendarData,
                );

                if (!iCalData) {
                  continue;
                }

                const event = this.parseICalData(
                  iCalData,
                  calendarObject.href || '',
                );

                if (
                  event &&
                  this.isEventInTimeRange(
                    {
                      url: calendarObject.href || '',
                      data: calendarObject.props.calendarData,
                      etag: calendarObject.props.getetag,
                    },
                    options.startDate,
                    options.endDate,
                  )
                ) {
                  allEvents.push(event);
                }
              }
            }
          } catch (fetchError) {
            this.logger.error(
              `Error in ${CalDavGetEventsService.name} - getEvents`,
              fetchError,
            );
          }
        }

        let newSyncToken = syncToken;

        try {
          const account = await this.getAccount();
          const updatedCalendars = await fetchCalendars({
            account,
            headers: this.headers,
          });
          const updatedCalendar = updatedCalendars.find(
            (cal) => cal.url === calendar.url,
          );

          if (updatedCalendar?.syncToken) {
            newSyncToken = updatedCalendar.syncToken.toString();
          }
        } catch (syncTokenError) {
          this.logger.error(
            `Error in ${CalDavGetEventsService.name} - getEvents`,
            syncTokenError,
          );
        }

        results.set(calendar.url, {
          events: allEvents,
          newSyncToken,
        });
      } catch {
        results.set(calendar.url, {
          events: [],
          newSyncToken: options.syncCursor?.syncTokens[calendar.url],
        });
      }
    });

    await Promise.all(syncPromises);

    const allEvents = Array.from(results.values())
      .map((result) => result.events)
      .flat();

    const syncTokens: Record<string, string> = {};

    for (const [calendarUrl, result] of results) {
      if (result.newSyncToken) {
        syncTokens[calendarUrl] = result.newSyncToken;
      }
    }

    return {
      events: allEvents,
      syncCursor: { syncTokens },
    };
  }

  /**
   * Extracts iCal data from various CalDAV server response formats.
   * Some servers return data directly as a string, others nest it under _cdata or some other properties.
   */
  private extractICalData(
    calendarData: string | Record<string, unknown>,
  ): string | null {
    if (!calendarData) return null;

    if (
      typeof calendarData === 'string' &&
      calendarData.includes('VCALENDAR')
    ) {
      return calendarData;
    }

    if (typeof calendarData === 'object' && calendarData !== null) {
      for (const key in calendarData) {
        const result = this.extractICalData(
          calendarData[key] as string | Record<string, unknown>,
        );

        if (result) return result;
      }
    }

    return null;
  }

  private isEventInTimeRange(
    davObject: DAVObject,
    startDate: Date,
    endDate: Date,
  ): boolean {
    try {
      if (!davObject.data) return false;

      const parsed = ical.parseICS(davObject.data);
      const events = Object.values(parsed).filter(
        (item) => item.type === 'VEVENT',
      );

      if (events.length === 0) return false;

      const event = events[0] as ical.VEvent;

      return event.start < endDate && event.end > startDate;
    } catch {
      return true;
    }
  }
}
