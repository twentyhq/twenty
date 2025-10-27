import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';
import { MicrosoftAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';
import { isAccessTokenExpiredOrInvalid } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/utils/is-access-token-expired-or-invalid.util';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

import { ConnectedAccountRefreshTokensService } from './connected-account-refresh-tokens.service';

jest.mock(
  'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/utils/is-access-token-expired-or-invalid.util',
);

describe('ConnectedAccountRefreshTokensService', () => {
  let service: ConnectedAccountRefreshTokensService;
  let microsoftAPIRefreshAccessTokenService: MicrosoftAPIRefreshAccessTokenService;
  let twentyORMManager: TwentyORMManager;

  const mockWorkspaceId = 'workspace-123';
  const mockConnectedAccountId = 'account-456';
  const mockAccessToken = 'valid-access-token';
  const mockRefreshToken = 'valid-refresh-token';
  const mockNewAccessToken = 'new-access-token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectedAccountRefreshTokensService,
        {
          provide: GoogleAPIRefreshAccessTokenService,
          useValue: {
            refreshTokens: jest.fn(),
          },
        },
        {
          provide: MicrosoftAPIRefreshAccessTokenService,
          useValue: {
            refreshTokens: jest.fn(),
          },
        },
        {
          provide: TwentyORMManager,
          useValue: {
            getRepository: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConnectedAccountRefreshTokensService>(
      ConnectedAccountRefreshTokensService,
    );
    microsoftAPIRefreshAccessTokenService =
      module.get<MicrosoftAPIRefreshAccessTokenService>(
        MicrosoftAPIRefreshAccessTokenService,
      );
    twentyORMManager = module.get<TwentyORMManager>(TwentyORMManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshAndSaveTokens', () => {
    it('should reuse valid access token without refreshing', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      } as ConnectedAccountWorkspaceEntity;

      (isAccessTokenExpiredOrInvalid as jest.Mock).mockReturnValue(false);

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
      expect(
        microsoftAPIRefreshAccessTokenService.refreshTokens,
      ).not.toHaveBeenCalled();
      expect(twentyORMManager.getRepository).not.toHaveBeenCalled();
    });

    it('should refresh and save new Microsoft token when expired', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      } as ConnectedAccountWorkspaceEntity;

      const mockRepository = { update: jest.fn() };
      const newTokens = {
        accessToken: mockNewAccessToken,
        refreshToken: mockRefreshToken,
      };

      (isAccessTokenExpiredOrInvalid as jest.Mock).mockReturnValue(true);
      jest
        .spyOn(microsoftAPIRefreshAccessTokenService, 'refreshTokens')
        .mockResolvedValue(newTokens);
      jest
        .spyOn(twentyORMManager, 'getRepository')
        .mockResolvedValue(mockRepository as any);

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual(newTokens);
      expect(
        microsoftAPIRefreshAccessTokenService.refreshTokens,
      ).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: mockConnectedAccountId },
        newTokens,
      );
    });

    it('should throw when refresh token is missing', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
        accessToken: mockAccessToken,
        refreshToken: null,
      } as unknown as ConnectedAccountWorkspaceEntity;

      await expect(
        service.refreshAndSaveTokens(connectedAccount, mockWorkspaceId),
      ).rejects.toThrow(
        new ConnectedAccountRefreshAccessTokenException(
          `No refresh token found for connected account ${mockConnectedAccountId} in workspace ${mockWorkspaceId}`,
          ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
        ),
      );
    });

    it('should throw when Microsoft refresh fails with axios error', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      } as ConnectedAccountWorkspaceEntity;

      const axiosError = {
        message: 'Request failed',
        response: {
          status: 400,
          data: { error: 'invalid_grant', error_description: 'Token expired' },
        },
      };

      (isAccessTokenExpiredOrInvalid as jest.Mock).mockReturnValue(true);
      jest
        .spyOn(microsoftAPIRefreshAccessTokenService, 'refreshTokens')
        .mockRejectedValue(axiosError);

      await expect(
        service.refreshAndSaveTokens(connectedAccount, mockWorkspaceId),
      ).rejects.toThrow(ConnectedAccountRefreshAccessTokenException);
    });
  });
});
