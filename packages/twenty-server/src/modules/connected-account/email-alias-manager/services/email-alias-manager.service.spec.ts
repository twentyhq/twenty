import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/google-email-alias-manager.service';
import { MicrosoftEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/microsoft-email-alias-manager.service';
import { microsoftGraphMeResponseWithProxyAddresses } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/mocks/microsoft-api-examples';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

import { EmailAliasManagerService } from './email-alias-manager.service';

describe('Email Alias Manager Service', () => {
  let emailAliasManagerService: EmailAliasManagerService;
  let microsoftEmailAliasManagerService: MicrosoftEmailAliasManagerService;
  let connectedAccountRepository: Partial<
    Repository<ConnectedAccountWorkspaceEntity>
  >;

  beforeEach(async () => {
    connectedAccountRepository = {
      // @ts-expect-error legacy noImplicitAny
      update: jest.fn().mockResolvedValue((arg) => arg),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TwentyORMManager,
          useValue: {
            getRepository: jest
              .fn()
              .mockResolvedValue(connectedAccountRepository),
          },
        },
        EmailAliasManagerService,
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
      const mockConnectedAccount: Partial<ConnectedAccountWorkspaceEntity> = {
        id: 'test-id',
        provider: ConnectedAccountProvider.MICROSOFT,
        refreshToken: 'test-refresh-token',
      };

      const expectedAliases =
        'bertrand2@domain.onmicrosoft.com,bertrand3@otherdomain.com';

      jest.spyOn(microsoftEmailAliasManagerService, 'getHandleAliases');

      await emailAliasManagerService.refreshHandleAliases(
        mockConnectedAccount as ConnectedAccountWorkspaceEntity,
      );

      expect(
        microsoftEmailAliasManagerService.getHandleAliases,
      ).toHaveBeenCalledWith(mockConnectedAccount);

      expect(connectedAccountRepository.update).toHaveBeenCalledWith(
        { id: mockConnectedAccount.id },
        {
          handleAliases: expectedAliases,
        },
      );
    });
  });
});
