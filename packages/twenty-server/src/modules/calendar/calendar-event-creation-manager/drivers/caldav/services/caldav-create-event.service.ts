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

      const filename = `${uid}.ics`;

      await client.createCalendarObject({
        calendar: targetCalendar,
        filename,
        iCalString: calendar.toString(),
      });

      // Source the resource href from the server through the same path the
      // import keys on, so a later sync reconciles this event instead of
      // duplicating it. Reconstructing the href locally risks a format mismatch
      // (full URL vs the server-relative path the provider returns).
      const reconstructedHref = new URL(filename, targetCalendar.url).href;

      let id = reconstructedHref;

      try {
        const [syncedEvent] =
          await this.calDavFetchEventsService.fetchEventsByHrefs(client, [
            reconstructedHref,
          ]);

        id = syncedEvent?.id ?? reconstructedHref;
      } catch {
        // The event was created; resolving its server href is best-effort, so
        // fall back to the reconstructed href rather than failing the create.
      }

      const now = new Date().toISOString();

      return {
        id,
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
