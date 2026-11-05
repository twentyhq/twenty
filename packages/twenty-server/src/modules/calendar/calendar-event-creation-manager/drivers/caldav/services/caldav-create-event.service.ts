import { Injectable } from '@nestjs/common';

import ical from 'ical-generator';
import { type DAVClient } from 'tsdav';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuid } from 'uuid';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { pickCalDavOrganizerEmail } from 'src/modules/calendar/calendar-event-creation-manager/drivers/utils/pick-caldav-organizer-email.util';
import {
  CalendarEventCreationException,
  CalendarEventCreationExceptionCode,
} from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { type CalendarEventCreationDriver } from 'src/modules/calendar/calendar-event-creation-manager/interfaces/calendar-event-creation-driver.interface';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav-client.provider';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

@Injectable()
export class CalDavCreateEventService implements CalendarEventCreationDriver {
  constructor(
    private readonly calDavClientProvider: CalDavClientProvider,
    private readonly calDavFetchEventsService: CalDavFetchEventsService,
  ) {}

  async createCalendarEvent(
    input: CalendarEventToCreate,
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'id' | 'provider' | 'handle'
    >,
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

      const organizerEmail =
        input.attendees.length > 0
          ? await this.resolveOrganizerEmail(client, connectedAccount.handle)
          : undefined;

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
        organizer: isDefined(organizerEmail)
          ? { name: organizerEmail, email: organizerEmail }
          : undefined,
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

      const attendeeParticipants = input.attendees
        .filter(
          (attendee) =>
            attendee.email.toLowerCase() !== organizerEmail?.toLowerCase(),
        )
        .map((attendee) => ({
          displayName: attendee.displayName ?? '',
          handle: attendee.email,
          responseStatus: CalendarEventParticipantResponseStatus.NEEDS_ACTION,
          isOrganizer: false,
        }));

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
        isPrivate: false,
        status: 'CONFIRMED',
        organizerHandle: '',
        conferenceLinkLabel: '',
        conferenceLinkUrl: '',
        conferenceSolution: '',
        externalCreatedAt: now,
        externalUpdatedAt: now,
        participants: isDefined(organizerEmail)
          ? [
              {
                displayName: organizerEmail,
                handle: organizerEmail.toLowerCase(),
                responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
                isOrganizer: true,
              },
              ...attendeeParticipants,
            ]
          : attendeeParticipants,
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

  private async resolveOrganizerEmail(
    client: DAVClient,
    handle: string,
  ): Promise<string> {
    const calendarUserAddresses = isDefined(client.account)
      ? await client
          .fetchCalendarUserAddresses({ account: client.account })
          .catch(() => [])
      : [];

    return pickCalDavOrganizerEmail({ calendarUserAddresses, handle });
  }
}
