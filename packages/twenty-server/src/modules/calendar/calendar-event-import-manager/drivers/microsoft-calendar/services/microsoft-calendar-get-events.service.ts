import { Injectable } from '@nestjs/common';

import {
  type PageCollection,
  PageIterator,
  type PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { parseMicrosoftCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/parse-microsoft-calendar-error.util';
import { type GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';

@Injectable()
export class MicrosoftCalendarGetEventsService {
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'accessToken' | 'id'
    >,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    try {
      const microsoftClient =
        await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);
      const eventIds: string[] = [];

      const response: PageCollection = await microsoftClient
        .api(syncCursor || '/me/calendar/events/delta')
        .version('beta')
        .get();

      const callback: PageIteratorCallback = (data) => {
        eventIds.push(data.id);

        return true;
      };

      const pageIterator = new PageIterator(
        microsoftClient,
        response,
        callback,
      );

      await pageIterator.iterate();

      return {
        fullEvents: false,
        calendarEventIds: eventIds,
        nextSyncCursor: pageIterator.getDeltaLink() || '',
      };
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
