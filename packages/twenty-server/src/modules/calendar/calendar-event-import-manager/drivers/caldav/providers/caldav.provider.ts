import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { CalDAVClient } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/caldav.client';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CalDavClientProvider {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  public async getCalDavCalendarClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'connectionParameters' | 'handle'
    >,
  ): Promise<CalDAVClient> {
    if (
      !connectedAccount.connectionParameters?.CALDAV?.password ||
      !connectedAccount.connectionParameters?.CALDAV?.host ||
      !isDefined(connectedAccount.handle)
    ) {
      throw new Error('Missing required CalDAV connection parameters');
    }

    const serverUrl = await this.secureHttpClientService.getValidatedUrl(
      connectedAccount.connectionParameters.CALDAV.host,
    );

    return new CalDAVClient({
      username:
        connectedAccount.connectionParameters.CALDAV.username ??
        connectedAccount.handle,
      password: connectedAccount.connectionParameters.CALDAV.password,
      serverUrl,
    });
  }
}
