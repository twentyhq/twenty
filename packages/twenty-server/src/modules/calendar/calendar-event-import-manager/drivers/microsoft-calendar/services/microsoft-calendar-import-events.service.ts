import { Injectable } from '@nestjs/common';

import { type Event } from '@microsoft/microsoft-graph-types';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { formatMicrosoftCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/format-microsoft-calendar-event.util';
import { parseMicrosoftCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/parse-microsoft-calendar-error.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';

@Injectable()
export class MicrosoftCalendarImportEventsService {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'accessToken' | 'refreshToken' | 'id'
    >,
    changedEventIds: string[],
  ): Promise<FetchedCalendarEvent[]> {
    try {
      const microsoftClient =
        await this.oAuth2ClientManagerService.getMicrosoftOAuth2Client(
          connectedAccount,
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
      if (isAccessTokenRefreshingError(error?.body)) {
        throw new CalendarEventImportDriverException(
          error.message,
          CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      throw parseMicrosoftCalendarError(error);
    }
  }
}
