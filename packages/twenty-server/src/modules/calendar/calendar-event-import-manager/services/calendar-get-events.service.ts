import { Injectable } from '@nestjs/common';

import { GoogleCalendarGetEventsService as GoogleCalendarGetCalendarEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/services/google-calendar-get-events.service';
import { CalendarEventWithParticipants } from 'src/modules/calendar/common/types/calendar-event';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type GetCalendarEventsResponse = {
  calendarEvents: CalendarEventWithParticipants[];
  nextSyncCursor: string;
};

@Injectable()
export class CalendarGetEventsService {
  constructor(
    private readonly googleCalendarGetCalendarEventsService: GoogleCalendarGetCalendarEventsService,
  ) {}

  public async getCalendarEvents(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<GetCalendarEventsResponse> {
    switch (connectedAccount.provider) {
      case 'google':
        return this.googleCalendarGetCalendarEventsService.getCalendarEvents(
          connectedAccount,
        );
      default:
        throw new Error(
          `Provider ${connectedAccount.provider} is not supported.`,
        );
    }
  }
}
