import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';

const createMockImapFlowInstance = () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  once: jest.fn(),
  off: jest.fn(),
});

const CONNECTED_ACCOUNT = {
  id: 'account-1',
  provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  handle: 'test@gmail.com',
  connectionParameters: {
    IMAP: {
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      username: 'test@gmail.com',
      password: 'test-password',
    },
  },
};

describe('ImapClientProvider', () => {
  let provider: ImapClientProvider;
  let mockSecureHttpClientService: jest.Mocked<SecureHttpClientService>;

  beforeEach(async () => {
    mockSecureHttpClientService = {
      getValidatedHost: jest.fn().mockResolvedValue('imap.gmail.com'),
    } as unknown as jest.Mocked<SecureHttpClientService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapClientProvider,
        {
          provide: SecureHttpClientService,
          useValue: mockSecureHttpClientService,
        },
      ],
    }).compile();

    provider = module.get(ImapClientProvider);
  });

  describe('getClient', () => {
    it('should register an error event handler on the ImapFlow client before connecting', async () => {
      const { ImapFlow } = await import('imapflow');
      const mockInstance = createMockImapFlowInstance();
      const onSpy = jest
        .spyOn(ImapFlow.prototype, 'on')
        .mockReturnValue(mockInstance as any);
      const connectSpy = jest
        .spyOn(ImapFlow.prototype, 'connect')
        .mockResolvedValue(undefined);

      await provider.getClient(CONNECTED_ACCOUNT);

      expect(onSpy).toHaveBeenCalledWith('error', expect.any(Function));
      // Ensure 'error' is registered BEFORE connect is called (call order check)
      expect(onSpy.mock.invocationCallOrder[0]).toBeLessThan(
        connectSpy.mock.invocationCallOrder[0],
      );

      onSpy.mockRestore();
      connectSpy.mockRestore();
    });

    it('should throw when connected account is not an IMAP provider', async () => {
      await expect(
        provider.getClient({
          id: 'bad',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          provider: 'other_provider' as any,
          handle: 'test@gmail.com',
          connectionParameters: {},
        }),
      ).rejects.toThrow('Connected account is not an IMAP provider');
    });

    it('should throw when connection parameters are missing', async () => {
      await expect(
        provider.getClient({
          id: 'bad',
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          handle: 'test@gmail.com',
          connectionParameters: {},
        }),
      ).rejects.toThrow('Connected account is not an IMAP provider');
    });
  });

  describe('closeClient', () => {
    it('should call logout on the client', async () => {
      const mockInstance = createMockImapFlowInstance();
      const logoutSpy = jest
        .spyOn(mockInstance, 'logout')
        .mockResolvedValue(undefined);

      await provider.closeClient(mockInstance as any);

      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });

    it('should not throw when logout fails', async () => {
      const mockInstance = createMockImapFlowInstance();
      jest
        .spyOn(mockInstance, 'logout')
        .mockRejectedValue(new Error('Logout failed'));

      // Should not re-throw — function must handle logout errors gracefully
      await expect(
        provider.closeClient(mockInstance as any),
      ).resolves.toBeUndefined();
    });
  });
});
