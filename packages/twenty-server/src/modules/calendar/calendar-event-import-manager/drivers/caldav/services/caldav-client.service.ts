import { Injectable } from '@nestjs/common';

import { DAVClient } from 'tsdav';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { createBasicDigestAuthFetch } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/auth/create-basic-digest-auth-fetch';

type CalDavConnectionParams = {
  serverUrl: string;
  username: string;
  password: string;
};

@Injectable()
export class CalDavClientService {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async getClient(input: CalDavConnectionParams): Promise<DAVClient> {
    const ssrfSafeFetch = this.secureHttpClientService.createSsrfSafeFetch();
    const fetch = createBasicDigestAuthFetch(
      input.username,
      input.password,
      ssrfSafeFetch,
    );

    const client = new DAVClient({
      serverUrl: input.serverUrl,
      credentials: { username: input.username, password: input.password },
      authMethod: 'Custom',
      // our fetch handles Basic+Digest itself; no-op authFunction so tsdav doesn't add its own header on top
      authFunction: async () => ({}),
      defaultAccountType: 'caldav',
      fetch,
    });

    await client.login();

    return client;
  }
}
