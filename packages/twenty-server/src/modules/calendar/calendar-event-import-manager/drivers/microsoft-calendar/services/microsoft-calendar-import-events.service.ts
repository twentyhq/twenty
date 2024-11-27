import { Injectable } from '@nestjs/common';

import { Event } from '@microsoft/microsoft-graph-types';

import { formatMicrosoftCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/format-microsoft-calendar-event.util';
import { parseMicrosoftCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/parse-microsoft-calendar-error.util';
import { CalendarEventWithParticipants } from 'src/modules/calendar/common/types/calendar-event';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class MicrosoftCalendarImportEventsService {
  constructor(
    private readonly microsoftOAuth2ClientManagerService: MicrosoftOAuth2ClientManagerService,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    changedEventIds: string[],
  ): Promise<CalendarEventWithParticipants[]> {
    try {
      const microsoftClient =
        await this.microsoftOAuth2ClientManagerService.getOAuth2Client(
          connectedAccount.refreshToken,
        );

      const events: Event[] = [];

      for (const changedEventId of changedEventIds) {
        const event = await microsoftClient
          .api(`/me/calendar/events/${changedEventId}`)
          .get();

        events.push(event);
      }

      return formatMicrosoftCalendarEvents(events);
    } catch (error) {
      throw parseMicrosoftCalendarError(error);
    }
  }
}
