import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import ical from 'ical-generator';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuid } from 'uuid';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalDavInvitationService } from 'src/modules/calendar/calendar-event-creation-manager/drivers/caldav/services/caldav-invitation.service';
import {
  CalendarEventCreationException,
  CalendarEventCreationExceptionCode,
} from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { type CalendarEventCreationDriver } from 'src/modules/calendar/calendar-event-creation-manager/interfaces/calendar-event-creation-driver.interface';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav-client.provider';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import {
  type FetchedCalendarEvent,
  type FetchedCalendarEventParticipant,
} from 'src/modules/calendar/common/types/fetched-calendar-event.type';

@Injectable()
export class CalDavCreateEventService implements CalendarEventCreationDriver {
  constructor(
    private readonly calDavClientProvider: CalDavClientProvider,
    private readonly calDavFetchEventsService: CalDavFetchEventsService,
    private readonly calDavInvitationService: CalDavInvitationService,
  ) {}

  async createCalendarEvent(
    input: CalendarEventToCreate,
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'id' | 'provider' | 'handle' | 'connectionParameters'
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

      const organizer =
        input.attendees.length > 0
          ? await this.calDavInvitationService.resolveOrganizer({
              client,
              calendarUrl: targetCalendar.url,
              handle: connectedAccount.handle,
            })
          : undefined;
      const organizerEmail = organizer?.email;
      const invitees = input.attendees.filter(
        (attendee) =>
          attendee.email.toLowerCase() !== organizerEmail?.toLowerCase(),
      );

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
          rsvp: true,
        })),
      });

      const filename = `${uid}.ics`;

      const createResponse = await client.createCalendarObject({
        calendar: targetCalendar,
        filename,
        iCalString: calendar.toString(),
      });

      // Source the resource href from the server through the same path the
      // import keys on, so a later sync reconciles this event instead of
      // duplicating it. Reconstructing the href locally risks a format mismatch
      // (full URL vs the server-relative path the provider returns).
      const reconstructedUrl = this.resolveCreatedEventUrl({
        location: createResponse.headers.get('location'),
        filename,
        calendarUrl: targetCalendar.url,
      });

      let id = reconstructedUrl.pathname;

      try {
        const [syncedEvent] =
          await this.calDavFetchEventsService.fetchEventsByHrefs(client, [
            reconstructedUrl.href,
          ]);

        id = syncedEvent?.id ?? id;
      } catch {
        // The event was created; resolving its server href is best-effort, so
        // fall back to the reconstructed href rather than failing the create.
      }

      if (isDefined(organizer) && !organizer.isServerScheduling) {
        await this.calDavInvitationService.sendInvitationEmail({
          connectedAccount,
          calendar,
          organizerEmail: organizer.email,
          inviteeEmails: invitees.map((invitee) => invitee.email),
          input,
        });
      }

      const now = new Date().toISOString();

      const participants: FetchedCalendarEventParticipant[] = invitees.map(
        (invitee) => ({
          displayName: invitee.displayName ?? '',
          handle: invitee.email,
          responseStatus: CalendarEventParticipantResponseStatus.NEEDS_ACTION,
          isOrganizer: false,
        }),
      );

      if (isDefined(organizerEmail)) {
        participants.unshift({
          displayName: organizerEmail,
          handle: organizerEmail.toLowerCase(),
          responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
          isOrganizer: true,
        });
      }

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
        participants,
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

  private resolveCreatedEventUrl({
    location,
    filename,
    calendarUrl,
  }: {
    location: string | null;
    filename: string;
    calendarUrl: string;
  }): URL {
    const locationUrl = isNonEmptyString(location)
      ? URL.parse(location, calendarUrl)
      : null;

    return locationUrl ?? new URL(filename, calendarUrl);
  }
}
