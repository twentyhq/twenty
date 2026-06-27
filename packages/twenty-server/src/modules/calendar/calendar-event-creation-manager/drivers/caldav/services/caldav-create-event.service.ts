import { Injectable } from '@nestjs/common';

import ical from 'ical-generator';
import { v4 as uuid } from 'uuid';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  CalendarEventCreationException,
  CalendarEventCreationExceptionCode,
} from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { type CalendarEventCreationDriver } from 'src/modules/calendar/calendar-event-creation-manager/interfaces/calendar-event-creation-driver.interface';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav-client.provider';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

@Injectable()
export class CalDavCreateEventService implements CalendarEventCreationDriver {
  constructor(
    private readonly calDavClientProvider: CalDavClientProvider,
    private readonly calDavFetchEventsService: CalDavFetchEventsService,
  ) {}

  async createCalendarEvent(
    input: CalendarEventToCreate,
    connectedAccount: Pick<ConnectedAccountEntity, 'id' | 'provider'>,
  ): Promise<FetchedCalendarEvent> {
    try {
      const client = await this.calDavClientProvider.getClient(
        connectedAccount.id,
      );

      const [targetCalendar] =
        await this.calDavFetchEventsService.listEventCalendars(client);

      if (!targetCalendar) {
        throw new CalendarEventCreationException(
          'No writable CalDAV calendar found',
          CalendarEventCreationExceptionCode.PROVIDER_REQUEST_FAILED,
        );
      }

      const uid = uuid();
      const calendar = ical({ prodId: '//Twenty//Calendar//EN' });

      calendar.createEvent({
        id: uid,
        start: new Date(input.startsAt),
        end: new Date(input.endsAt),
        allDay: input.isFullDay,
        summary: input.title,
        description: input.description,
        location: input.location,
        attendees: input.attendees.map((attendee) => ({
          email: attendee.email,
          name: attendee.displayName,
        })),
      });

      await client.createCalendarObject({
        calendar: targetCalendar,
        filename: `${uid}.ics`,
        iCalString: calendar.toString(),
      });

      const now = new Date().toISOString();

      return {
        id: new URL(`${uid}.ics`, targetCalendar.url).href,
        iCalUid: uid,
        title: input.title,
        description: input.description ?? '',
        location: input.location ?? '',
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        isFullDay: input.isFullDay,
        isCanceled: false,
        status: 'CONFIRMED',
        conferenceLinkLabel: '',
        conferenceLinkUrl: '',
        conferenceSolution: '',
        externalCreatedAt: now,
        externalUpdatedAt: now,
        participants: input.attendees.map((attendee) => ({
          displayName: attendee.displayName ?? '',
          handle: attendee.email,
          responseStatus: 'needsAction',
          isOrganizer: false,
        })),
      };
    } catch (error) {
      if (error instanceof CalendarEventCreationException) {
        throw error;
      }

      throw new CalendarEventCreationException(
        `Failed to create CalDAV calendar event: ${error instanceof Error ? error.message : 'unknown error'}`,
        CalendarEventCreationExceptionCode.PROVIDER_REQUEST_FAILED,
      );
    }
  }
}
