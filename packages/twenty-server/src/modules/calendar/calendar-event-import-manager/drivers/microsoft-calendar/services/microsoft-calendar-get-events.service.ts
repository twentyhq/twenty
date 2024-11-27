import { Injectable } from '@nestjs/common';

import {
  PageCollection,
  PageIterator,
  PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';

import { parseMicrosoftCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/parse-microsoft-calendar-error.util';
import { GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class MicrosoftCalendarGetEventsService {
  constructor(
    private readonly microsoftOAuth2ClientManagerService: MicrosoftOAuth2ClientManagerService,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    try {
      const microsoftClient =
        await this.microsoftOAuth2ClientManagerService.getOAuth2Client(
          connectedAccount.refreshToken,
        );
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
      throw parseMicrosoftCalendarError(error);
    }
  }
}
