import { Injectable } from '@nestjs/common';

import { CalDAVClient } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/caldav.client';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CalDavCalendarClientProvider {
  public async getCalDavCalendarClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'connectionParameters' | 'handle'
    >,
  ): Promise<CalDAVClient> {
    const caldavClient = new CalDAVClient({
      username: connectedAccount.handle,
      password: connectedAccount.connectionParameters?.CALDAV?.password || '',
      serverUrl: connectedAccount.connectionParameters?.CALDAV?.host || '',
    });

    return caldavClient;
  }
}
