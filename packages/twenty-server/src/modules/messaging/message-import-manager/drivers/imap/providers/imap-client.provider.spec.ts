import { ConnectedAccountProvider } from 'twenty-shared/types';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';

const mockConnect = jest.fn();
const mockLogout = jest.fn();
const mockOn = jest.fn();

jest.mock('imapflow', () => ({
  ImapFlow: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    logout: mockLogout,
    on: mockOn,
  })),
}));

describe('ImapClientProvider', () => {
  let provider: ImapClientProvider;

  const secureHttpClientService = {
    getValidatedHost: jest.fn().mockResolvedValue('imap.example.com'),
  } as unknown as SecureHttpClientService;

  const connectedAccount = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    handle: 'test@example.com',
    connectionParameters: {
      IMAP: {
        host: 'imap.example.com',
        port: 993,
        secure: true,
        password: 'password',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockResolvedValue(undefined);
    mockLogout.mockResolvedValue(undefined);

    provider = new ImapClientProvider(secureHttpClientService);
  });

  it('attaches an error listener before connecting the IMAP client', async () => {
    await provider.getClient(connectedAccount);

    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockOn).toHaveBeenCalledBefore(mockConnect);
  });
});
