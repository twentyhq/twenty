import { Injectable } from '@nestjs/common';

import {
  type PageCollection,
  PageIterator,
  type PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';

import { parseMicrosoftCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/parse-microsoft-calendar-error.util';
import { type GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class MicrosoftCalendarGetEventsService {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    try {
      const microsoftClient =
        await this.microsoftOAuth2ClientProvider.getClient(connectedAccount.id);
      const eventIds: string[] = [];
      const eventIdsToDelete: string[] = [];

      const response: PageCollection = await microsoftClient
        .api(syncCursor || '/me/calendar/events/delta')
        .version('beta')
        .get();

      const callback: PageIteratorCallback = (data) => {
        if (data['@removed']) {
          eventIdsToDelete.push(data.id);
        } else {
          eventIds.push(data.id);
        }

        return true;
      };

      const pageIterator = new PageIterator(
        microsoftClient,
        response,
        callback,
      );

      await pageIterator.iterate();

      return {
        calendarEventIds: eventIds,
        calendarEventIdsToDelete: eventIdsToDelete,
        nextSyncCursor: pageIterator.getDeltaLink() || '',
      };
    } catch (error) {
      throw parseMicrosoftCalendarError(error);
    }
  }
}
