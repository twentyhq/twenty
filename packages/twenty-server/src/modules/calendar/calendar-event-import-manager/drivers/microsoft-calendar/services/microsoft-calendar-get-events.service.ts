import { Injectable } from '@nestjs/common';

import {
  type PageCollection,
  PageIterator,
  type PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';

import { MicrosoftCalendarEventListFetchErrorHandler } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-event-list-fetch-error-handler.service';
import { type GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class MicrosoftCalendarGetEventsService {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
    private readonly microsoftCalendarEventListFetchErrorHandler: MicrosoftCalendarEventListFetchErrorHandler,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    const microsoftClient = await this.microsoftOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const eventIds: string[] = [];
    const eventIdsToDelete: string[] = [];

    const response: PageCollection = await microsoftClient
      .api(syncCursor || '/me/calendar/events/delta')
      .version('beta')
      .get()
      .catch((error: unknown) =>
        this.microsoftCalendarEventListFetchErrorHandler.handleError(error),
      );

    const callback: PageIteratorCallback = (data) => {
      if (data['@removed']) {
        eventIdsToDelete.push(data.id);
      } else {
        eventIds.push(data.id);
      }

      return true;
    };

    const pageIterator = new PageIterator(microsoftClient, response, callback);

    await pageIterator.iterate().catch((error: unknown) => {
      this.microsoftCalendarEventListFetchErrorHandler.handleError(error);
    });

    return {
      calendarEventIds: eventIds,
      calendarEventIdsToDelete: eventIdsToDelete,
      nextSyncCursor: pageIterator.getDeltaLink() || '',
    };
  }
}
