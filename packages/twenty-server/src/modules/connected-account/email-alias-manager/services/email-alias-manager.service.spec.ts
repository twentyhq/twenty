import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/services/google-email-alias-manager.service';
import { microsoftGraphMeResponseWithProxyAddresses } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/mocks/microsoft-api-examples';
import { MicrosoftEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/services/microsoft-email-alias-manager.service';
import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';

import { EmailAliasManagerService } from './email-alias-manager.service';

describe('Email Alias Manager Service', () => {
  let emailAliasManagerService: EmailAliasManagerService;
  let microsoftEmailAliasManagerService: MicrosoftEmailAliasManagerService;
  const mockConnectedAccountRepository = {
    // @ts-expect-error legacy noImplicitAny
    update: jest.fn().mockResolvedValue((arg) => arg),
  };
  const mockMessageChannelRepository = {
    exists: jest.fn().mockResolvedValue(true),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest
              .fn()
              .mockImplementation((fn: () => any, _authContext?: any) => fn()),
          },
        },
        EmailAliasManagerService,
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: mockConnectedAccountRepository,
        },
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: mockMessageChannelRepository,
        },
        {
          provide: GoogleEmailAliasManagerService,
          useValue: {},
        },
        MicrosoftEmailAliasManagerService,
        {
          provide: MicrosoftOAuth2ClientProvider,
          useValue: {
            getClient: jest.fn().mockResolvedValue({
              api: jest.fn().mockReturnValue({
                get: jest
                  .fn()
                  .mockResolvedValue(
                    microsoftGraphMeResponseWithProxyAddresses,
                  ),
              }),
            }),
          },
        },
      ],
    }).compile();

    emailAliasManagerService = module.get<EmailAliasManagerService>(
      EmailAliasManagerService,
    );
    microsoftEmailAliasManagerService =
      module.get<MicrosoftEmailAliasManagerService>(
        MicrosoftEmailAliasManagerService,
      );
  });

  it('Service should be defined', () => {
    expect(emailAliasManagerService).toBeDefined();
  });

  describe('Refresh handle aliases for Microsoft', () => {
    it('Should refresh Microsoft handle aliases successfully', async () => {
      const mockConnectedAccount: Partial<ConnectedAccountEntity> = {
        id: 'test-id',
        provider: ConnectedAccountProvider.MICROSOFT,
      };

      const expectedAliases = [
        'bertrand2@domain.onmicrosoft.com',
        'bertrand3@otherdomain.com',
      ];

      jest.spyOn(microsoftEmailAliasManagerService, 'getHandleAliases');

      await emailAliasManagerService.refreshHandleAliases(
        mockConnectedAccount as ConnectedAccountEntity,
        'test-workspace-id',
      );

      expect(
        microsoftEmailAliasManagerService.getHandleAliases,
      ).toHaveBeenCalledWith(mockConnectedAccount);

      expect(mockConnectedAccountRepository.update).toHaveBeenCalledWith(
        { id: mockConnectedAccount.id, workspaceId: 'test-workspace-id' },
        {
          handleAliases: expectedAliases,
        },
      );
    });
  });

  describe('Refresh handle aliases without a mailbox', () => {
    it('Should preserve existing aliases and skip the update when the account has no message channel', async () => {
      mockMessageChannelRepository.exists.mockResolvedValueOnce(false);

      const existingAliases = ['existing@domain.com'];
      const mockConnectedAccount: Partial<ConnectedAccountEntity> = {
        id: 'test-id',
        provider: ConnectedAccountProvider.GOOGLE,
        handleAliases: existingAliases,
      };

      jest.spyOn(microsoftEmailAliasManagerService, 'getHandleAliases');

      const result = await emailAliasManagerService.refreshHandleAliases(
        mockConnectedAccount as ConnectedAccountEntity,
        'test-workspace-id',
      );

      expect(result).toEqual(existingAliases);
      expect(
        microsoftEmailAliasManagerService.getHandleAliases,
      ).not.toHaveBeenCalled();
      expect(mockConnectedAccountRepository.update).not.toHaveBeenCalled();
    });
  });
});
