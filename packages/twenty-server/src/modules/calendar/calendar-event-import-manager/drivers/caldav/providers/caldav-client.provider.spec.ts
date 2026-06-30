import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { CalendarEventImportDriverExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { CalDavClientService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-client.service';

import { CalDavClientProvider } from './caldav-client.provider';

const mockCalDavParams = {
  host: 'https://caldav.example.com',
  username: 'user@example.com',
  password: 'plaintext-password',
};

const mockConnectionParameters = {
  CALDAV: {
    host: 'https://caldav.example.com',
    username: 'user@example.com',
    password: 'encrypted-password',
  },
};

describe('CalDavClientProvider', () => {
  let provider: CalDavClientProvider;
  let connectedAccountRepository: { findOne: jest.Mock };
  let connectedAccountTokenEncryptionService: {
    decryptProtocolPassword: jest.Mock;
  };
  let calDavClientService: { getClient: jest.Mock };

  const mockWorkspaceId = 'workspace-123';
  const mockConnectedAccountId = 'account-456';

  const mockConnectedAccount = {
    id: mockConnectedAccountId,
    workspaceId: mockWorkspaceId,
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    handle: 'user@example.com',
    connectionParameters: mockConnectionParameters,
  } as unknown as ConnectedAccountEntity;

  beforeEach(async () => {
    connectedAccountTokenEncryptionService = {
      decryptProtocolPassword: jest.fn().mockReturnValue(mockCalDavParams),
    };

    calDavClientService = {
      getClient: jest
        .fn()
        .mockResolvedValue({ options: { serverUrl: mockCalDavParams.host } }),
    };

    connectedAccountRepository = {
      findOne: jest.fn().mockResolvedValue(mockConnectedAccount),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalDavClientProvider,
        {
          provide: CalDavClientService,
          useValue: calDavClientService,
        },
        {
          provide: ConnectedAccountTokenEncryptionService,
          useValue: connectedAccountTokenEncryptionService,
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: connectedAccountRepository,
        },
      ],
    }).compile();

    provider = module.get<CalDavClientProvider>(CalDavClientProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getClient', () => {
    it('should load the entity, decrypt CalDAV params, and return a DAVClient', async () => {
      const client = await provider.getClient(mockConnectedAccountId);

      expect(connectedAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockConnectedAccountId },
      });
      expect(
        connectedAccountTokenEncryptionService.decryptProtocolPassword,
      ).toHaveBeenCalledWith({
        protocolParams: mockConnectionParameters.CALDAV,
        workspaceId: mockWorkspaceId,
      });
      expect(calDavClientService.getClient).toHaveBeenCalledWith({
        serverUrl: mockCalDavParams.host,
        username: mockCalDavParams.username,
        password: mockCalDavParams.password,
      });
      expect(client).toBeDefined();
    });

    it('should throw INSUFFICIENT_PERMISSIONS when the connected account does not exist', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(null);

      await expect(
        provider.getClient(mockConnectedAccountId),
      ).rejects.toMatchObject({
        code: CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      });
    });

    it('should throw INSUFFICIENT_PERMISSIONS when CalDAV credentials are missing', async () => {
      connectedAccountRepository.findOne.mockResolvedValue({
        ...mockConnectedAccount,
        provider: ConnectedAccountProvider.GOOGLE,
        connectionParameters: {},
      });

      await expect(
        provider.getClient(mockConnectedAccountId),
      ).rejects.toMatchObject({
        code: CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      });
    });
  });
});
