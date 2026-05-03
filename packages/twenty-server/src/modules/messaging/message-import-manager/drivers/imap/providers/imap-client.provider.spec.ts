import { Test, type TestingModule } from '@nestjs/testing';
import { ImapClientProvider } from './imap-client.provider';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';

jest.mock('imapflow');

describe('ImapClientProvider', () => {
  let provider: ImapClientProvider;

  const mockConnectedAccount = {
    id: 'account-1',
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    handle: 'test@example.com',
    connectionParameters: {
      IMAP: {
        host: 'imap.example.com',
        port: 993,
        secure: true,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapClientProvider,
        {
          provide: SecureHttpClientService,
          useValue: {
            getValidatedHost: jest.fn().mockResolvedValue('imap.example.com'),
          },
        },
      ],
    }).compile();

    provider = module.get<ImapClientProvider>(ImapClientProvider);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getClient', () => {
    it('should create a new connection if none exists', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      (ImapFlow as jest.Mock).mockImplementation(() => ({
        connect: mockConnect,
        usable: true,
      }));

      const client = await provider.getClient(mockConnectedAccount as any);

      expect(ImapFlow).toHaveBeenCalled();
      expect(mockConnect).toHaveBeenCalled();
      expect(client).toBeDefined();
    });

    it('should reuse connection if it exists and is usable', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      const mockClient = {
        connect: mockConnect,
        usable: true,
      };
      (ImapFlow as jest.Mock).mockImplementation(() => mockClient);

      await provider.getClient(mockConnectedAccount as any);
      const client2 = await provider.getClient(mockConnectedAccount as any);

      expect(ImapFlow).toHaveBeenCalledTimes(1);
      expect(client2).toBe(mockClient);
    });

    it('should create a new connection if cached one is not usable', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      (ImapFlow as jest.Mock)
        .mockImplementationOnce(() => ({
          connect: mockConnect,
          usable: false,
          logout: jest.fn(),
        }))
        .mockImplementationOnce(() => ({
          connect: mockConnect,
          usable: true,
        }));

      await provider.getClient(mockConnectedAccount as any);
      await provider.getClient(mockConnectedAccount as any);

      expect(ImapFlow).toHaveBeenCalledTimes(2);
    });

    it('should retry connection on failure', async () => {
      const mockConnect = jest
        .fn()
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(undefined);

      (ImapFlow as jest.Mock).mockImplementation(() => ({
        connect: mockConnect,
        usable: true,
        logout: jest.fn(),
      }));

      await provider.getClient(mockConnectedAccount as any);

      expect(mockConnect).toHaveBeenCalledTimes(2);
    });
  });

  describe('closeClient', () => {
    it('should logout and remove client from cache', async () => {
      const mockLogout = jest.fn().mockResolvedValue(undefined);
      (ImapFlow as jest.Mock).mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(undefined),
        logout: mockLogout,
        usable: true,
      }));

      await provider.getClient(mockConnectedAccount as any);
      await provider.closeClient(mockConnectedAccount.id);

      expect(mockLogout).toHaveBeenCalled();

      // Verify it's removed from cache by getting it again
      await provider.getClient(mockConnectedAccount as any);
      expect(ImapFlow).toHaveBeenCalledTimes(2);
    });
  });
});
