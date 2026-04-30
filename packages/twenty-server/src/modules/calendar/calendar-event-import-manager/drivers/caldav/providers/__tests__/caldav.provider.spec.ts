import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

jest.mock(
  'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/caldav.client',
  () => ({
    CalDAVClient: jest.fn().mockImplementation((creds) => creds),
  }),
);

import { CalDAVClient } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/caldav.client';

const MockCalDAVClient = jest.mocked(CalDAVClient);

describe('CalDavClientProvider', () => {
  describe('getCalDavCalendarClient', () => {
    it('should pass SSRF-safe fetch to CalDAVClient', async () => {
      const fakeFetch = jest.fn();
      const mockSecureHttpClientService = {
        createSsrfSafeFetch: jest.fn().mockReturnValue(fakeFetch),
      } as unknown as SecureHttpClientService;

      const provider = new CalDavClientProvider(mockSecureHttpClientService);

      const connectedAccount = {
        id: 'account-1',
        provider: 'IMAP_SMTP_CALDAV',
        handle: 'user@example.com',
        connectionParameters: {
          CALDAV: {
            host: 'https://caldav.example.com',
            password: 'secret',
            username: 'caldav-user',
          },
        },
      } as unknown as Pick<
        ConnectedAccountEntity,
        'id' | 'provider' | 'connectionParameters' | 'handle'
      >;

      await provider.getCalDavCalendarClient(connectedAccount);

      expect(
        mockSecureHttpClientService.createSsrfSafeFetch,
      ).toHaveBeenCalledTimes(1);
      expect(MockCalDAVClient).toHaveBeenCalledWith(
        expect.objectContaining({ fetch: fakeFetch }),
      );
    });
  });
});
