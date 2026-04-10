import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/services/google-email-alias-manager.service';
import { microsoftGraphMeResponseWithProxyAddresses } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/mocks/microsoft-api-examples';
import { MicrosoftEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/services/microsoft-email-alias-manager.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';

import { EmailAliasManagerService } from './email-alias-manager.service';

describe('Email Alias Manager Service', () => {
  let emailAliasManagerService: EmailAliasManagerService;
  let microsoftEmailAliasManagerService: MicrosoftEmailAliasManagerService;
  const mockConnectedAccountRepository = {
    // @ts-expect-error legacy noImplicitAny
    update: jest.fn().mockResolvedValue((arg) => arg),
  };

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
          provide: GoogleEmailAliasManagerService,
          useValue: {},
        },
        MicrosoftEmailAliasManagerService,
        {
          provide: OAuth2ClientManagerService,
          useValue: {
            getMicrosoftOAuth2Client: jest.fn().mockResolvedValue({
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
        refreshToken: 'test-refresh-token',
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
});
