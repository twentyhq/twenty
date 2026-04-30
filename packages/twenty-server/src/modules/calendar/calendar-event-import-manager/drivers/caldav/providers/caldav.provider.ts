import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { CalDAVClient } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/caldav.client';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class CalDavClientProvider {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  public async getCalDavCalendarClient(
    connectedAccount: Pick<
      ConnectedAccountEntity,
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

    const serverUrl = connectedAccount.connectionParameters.CALDAV.host;
    const ssrfSafeFetch = this.secureHttpClientService.createSsrfSafeFetch();

    return new CalDAVClient({
      username:
        connectedAccount.connectionParameters.CALDAV.username ??
        connectedAccount.handle,
      password: connectedAccount.connectionParameters.CALDAV.password,
      serverUrl,
      fetch: ssrfSafeFetch,
    });
  }
}
