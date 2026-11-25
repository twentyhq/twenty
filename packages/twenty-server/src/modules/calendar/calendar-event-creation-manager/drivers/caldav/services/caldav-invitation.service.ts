import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type ICalCalendar, ICalCalendarMethod } from 'ical-generator';
import { type DAVClient } from 'tsdav';
import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { pickCalDavOrganizerEmail } from 'src/modules/calendar/calendar-event-creation-manager/drivers/utils/pick-caldav-organizer-email.util';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { formatMessageFromHeader } from 'src/modules/messaging/message-outbound-manager/utils/format-message-from-header.util';

@Injectable()
export class CalDavInvitationService {
  constructor(
    private readonly smtpClientProvider: SmtpClientProvider,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async resolveOrganizer({
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
          .catch((error) => {
            this.exceptionHandlerService.captureExceptions([error]);

            return [];
          })
      : [];

    return {
      email: pickCalDavOrganizerEmail({ calendarUserAddresses, handle }),
      isServerScheduling,
    };
  }

  async sendInvitationEmail({
    connectedAccount,
    calendar,
    organizerEmail,
    inviteeEmails,
    input,
  }: {
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'id' | 'connectionParameters'
    >;
    calendar: ICalCalendar;
    organizerEmail: string;
    inviteeEmails: string[];
    input: CalendarEventToCreate;
  }): Promise<void> {
    if (
      inviteeEmails.length === 0 ||
      !isDefined(connectedAccount.connectionParameters?.SMTP)
    ) {
      return;
    }

    calendar.method(ICalCalendarMethod.REQUEST);

    await this.smtpClientProvider
      .getClient(connectedAccount.id)
      .then((smtpClient) =>
        smtpClient.sendMail({
          from: formatMessageFromHeader({
            fromEmail: organizerEmail,
            fromName: connectedAccount.connectionParameters?.name,
          }),
          to: inviteeEmails,
          subject: input.title,
          text: [input.title, input.location, input.description]
            .filter(isNonEmptyString)
            .join('\n\n'),
          icalEvent: {
            method: ICalCalendarMethod.REQUEST,
            content: calendar.toString(),
          },
        }),
      )
      .catch((error) =>
        this.exceptionHandlerService.captureExceptions([error]),
      );
  }
}
