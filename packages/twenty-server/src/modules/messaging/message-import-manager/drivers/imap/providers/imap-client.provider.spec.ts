import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { ImapClientProvider } from './imap-client.provider';

jest.mock('imapflow', () => ({
  ImapFlow: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  })),
}));

const mockImapParams = {
  host: 'imap.example.com',
  port: 993,
  username: 'user@example.com',
  password: 'plaintext-password',
};

const mockConnectionParameters = {
  IMAP: {
    host: 'imap.example.com',
    port: 993,
    username: 'user@example.com',
    password: 'encrypted-password',
  },
};

const mockConnectedAccount = {
  id: 'account-456',
  workspaceId: 'workspace-123',
  provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  handle: 'user@example.com',
  connectionParameters: mockConnectionParameters,
} as unknown as ConnectedAccountEntity;

describe('ImapClientProvider', () => {
  let provider: ImapClientProvider;

  const mockGetValidatedHost = jest
    .fn()
    .mockImplementation(() => Promise.resolve('93.184.216.34'));

  const mockDecryptProtocolPassword = jest.fn();

  const mockTwentyConfigGet = jest.fn().mockReturnValue(false);

  beforeEach(async () => {
    jest.clearAllMocks();
    mockTwentyConfigGet.mockReturnValue(false);
    mockDecryptProtocolPassword.mockReturnValue(mockImapParams);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapClientProvider,
        {
          provide: SecureHttpClientService,
          useValue: { getValidatedHost: mockGetValidatedHost },
        },
        {
          provide: ConnectedAccountTokenEncryptionService,
          useValue: {
            decryptProtocolPassword: mockDecryptProtocolPassword,
          },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: mockTwentyConfigGet },
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockConnectedAccount),
          } as unknown as Repository<ConnectedAccountEntity>,
        },
      ],
    }).compile();

    provider = module.get<ImapClientProvider>(ImapClientProvider);
  });

  describe('getClient', () => {
    it('connects to the validated IP while validating TLS against the configured host', async () => {
      await provider.getClient('account-456');

      expect(mockGetValidatedHost).toHaveBeenCalledWith('imap.example.com');
      expect(ImapFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          host: '93.184.216.34',
          tls: expect.objectContaining({ servername: 'imap.example.com' }),
        }),
      );
    });

    it('does not set a servername when the configured host is an IP literal', async () => {
      mockDecryptProtocolPassword.mockReturnValue({
        ...mockImapParams,
        host: '93.184.216.34',
      });

      await provider.getClient('account-456');

      expect(ImapFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          host: '93.184.216.34',
          tls: { rejectUnauthorized: true },
        }),
      );
    });

    it('verifies TLS certificates by default', async () => {
      await provider.getClient('account-456');

      expect(mockTwentyConfigGet).toHaveBeenCalledWith(
        'MAIL_TLS_ALLOW_SELF_SIGNED',
      );
      expect(ImapFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          tls: { rejectUnauthorized: true, servername: 'imap.example.com' },
        }),
      );
    });

    it('skips TLS certificate verification when MAIL_TLS_ALLOW_SELF_SIGNED is enabled', async () => {
      mockTwentyConfigGet.mockReturnValue(true);

      await provider.getClient('account-456');

      expect(ImapFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          tls: { rejectUnauthorized: false, servername: 'imap.example.com' },
        }),
      );
    });
  });
});
