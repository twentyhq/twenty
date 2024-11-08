import { Injectable } from '@nestjs/common';

import { GoogleCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/services/google-calendar-get-events.service';
import { MicrosoftCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-get-events.service';
import {
  CalendarEventImportException,
  CalendarEventImportExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/exceptions/calendar-event-import.exception';
import { CalendarEventWithParticipants } from 'src/modules/calendar/common/types/calendar-event';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type GetCalendarEventsResponse = {
  fullEvents: boolean;
  calendarEvents?: CalendarEventWithParticipants[];
  calendarEventIds?: string[];
  nextSyncCursor: string;
};

@Injectable()
export class CalendarGetCalendarEventsService {
  constructor(
    private readonly googleCalendarGetEventsService: GoogleCalendarGetEventsService,
    private readonly microsoftCalendarGetEventsService: MicrosoftCalendarGetEventsService,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    switch (connectedAccount.provider) {
      case 'google':
        return this.googleCalendarGetEventsService.getCalendarEvents(
          connectedAccount,
          syncCursor,
        );
      case 'microsoft':
        return this.microsoftCalendarGetEventsService.getCalendarEvents(
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
