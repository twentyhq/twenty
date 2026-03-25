import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CalDavGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-get-events.service';
import { GoogleCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/services/google-calendar-get-events.service';
import { MicrosoftCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-get-events.service';
import {
  CalendarEventImportException,
  CalendarEventImportExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/exceptions/calendar-event-import.exception';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type GetCalendarEventsResponse = {
  fullEvents: boolean;
  calendarEvents?: FetchedCalendarEvent[];
  calendarEventIds?: string[];
  nextSyncCursor: string;
};

@Injectable()
export class CalendarGetCalendarEventsService {
  constructor(
    private readonly googleCalendarGetEventsService: GoogleCalendarGetEventsService,
    private readonly microsoftCalendarGetEventsService: MicrosoftCalendarGetEventsService,
    private readonly caldavCalendarGetEventsService: CalDavGetEventsService,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      | 'provider'
      | 'accessToken'
      | 'refreshToken'
      | 'id'
      | 'connectionParameters'
      | 'handle'
    >,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.googleCalendarGetEventsService.getCalendarEvents(
          connectedAccount,
          syncCursor,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftCalendarGetEventsService.getCalendarEvents(
          connectedAccount,
          syncCursor,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.caldavCalendarGetEventsService.getCalendarEvents(
          connectedAccount,
          syncCursor,
        );
      default:
        throw new CalendarEventImportException(
          `Provider ${connectedAccount.provider} is not supported`,
          CalendarEventImportExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
