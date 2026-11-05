import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import ical, { ICalCalendarMethod } from 'ical-generator';
import { type DAVClient } from 'tsdav';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuid } from 'uuid';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
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
import {
  type FetchedCalendarEvent,
  type FetchedCalendarEventParticipant,
} from 'src/modules/calendar/common/types/fetched-calendar-event.type';
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { formatMessageFromHeader } from 'src/modules/messaging/message-outbound-manager/utils/format-message-from-header.util';

@Injectable()
export class CalDavCreateEventService implements CalendarEventCreationDriver {
  constructor(
    private readonly calDavClientProvider: CalDavClientProvider,
    private readonly calDavFetchEventsService: CalDavFetchEventsService,
    private readonly smtpClientProvider: SmtpClientProvider,
    private readonly exceptionHandlerService: ExceptionHandlerService,
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
          ? await this.resolveOrganizer({
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

      if (
        isDefined(organizer) &&
        !organizer.isServerScheduling &&
        invitees.length > 0 &&
        isDefined(connectedAccount.connectionParameters?.SMTP)
      ) {
        calendar.method(ICalCalendarMethod.REQUEST);

        await this.emailInvitation({
          connectedAccount,
          organizerEmail: organizer.email,
          inviteeEmails: invitees.map((invitee) => invitee.email),
          input,
          iCalString: calendar.toString(),
        }).catch((error) =>
          this.exceptionHandlerService.captureExceptions([error]),
        );
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

  private async resolveOrganizer({
    client,
    calendarUrl,
    handle,
  }: {
    client: DAVClient;
    calendarUrl: string;
    handle: string;
  }): Promise<{ email: string; isServerScheduling: boolean }> {
    const optionsResponse = await client.fetchOverride?.(calendarUrl, {
      method: 'OPTIONS',
    });
    const isServerScheduling =
      optionsResponse?.headers
        .get('dav')
        ?.toLowerCase()
        .includes('calendar-auto-schedule') ?? false;

    if (!isServerScheduling) {
      return { email: handle, isServerScheduling };
    }

    const calendarUserAddresses = isDefined(client.account)
      ? await client
          .fetchCalendarUserAddresses({ account: client.account })
          .catch(() => [])
      : [];

    return {
      email: pickCalDavOrganizerEmail({ calendarUserAddresses, handle }),
      isServerScheduling,
    };
  }

  private async emailInvitation({
    connectedAccount,
    organizerEmail,
    inviteeEmails,
    input,
    iCalString,
  }: {
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'id' | 'connectionParameters'
    >;
    organizerEmail: string;
    inviteeEmails: string[];
    input: CalendarEventToCreate;
    iCalString: string;
  }): Promise<void> {
    const smtpClient = await this.smtpClientProvider.getClient(
      connectedAccount.id,
    );

    await smtpClient.sendMail({
      from: formatMessageFromHeader({
        fromEmail: organizerEmail,
        fromName: connectedAccount.connectionParameters?.name,
      }),
      to: inviteeEmails,
      subject: input.title,
      text: [input.title, input.location, input.description]
        .filter(isNonEmptyString)
        .join('\n\n'),
      icalEvent: { method: ICalCalendarMethod.REQUEST, content: iCalString },
    });
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
