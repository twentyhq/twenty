import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-access-token.service';
import { MicrosoftAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

import { ConnectedAccountRefreshTokensService } from './connected-account-refresh-tokens.service';

describe('ConnectedAccountRefreshTokensService', () => {
  let service: ConnectedAccountRefreshTokensService;
  let googleAPIRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService;
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
          provide: JwtWrapperService,
          useValue: {
            isTokenExpired: jest.fn(),
          },
        },
        {
          provide: GoogleAPIRefreshAccessTokenService,
          useValue: {
            refreshAccessToken: jest.fn(),
            isAccessTokenExpired: jest.fn(),
          },
        },
        {
          provide: MicrosoftAPIRefreshAccessTokenService,
          useValue: {
            refreshTokens: jest.fn(),
            isAccessTokenExpired: jest.fn(),
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
    googleAPIRefreshAccessTokenService =
      module.get<GoogleAPIRefreshAccessTokenService>(
        GoogleAPIRefreshAccessTokenService,
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
    it('should return existing token when not expired', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      } as ConnectedAccountWorkspaceEntity;

      jest.spyOn(service, 'checkAccessTokenValidity').mockResolvedValue(true);

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(
        googleAPIRefreshAccessTokenService.refreshAccessToken,
      ).not.toHaveBeenCalled();
      expect(twentyORMManager.getRepository).not.toHaveBeenCalled();
    });

    it('should refresh and save new Google token when expired', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      } as ConnectedAccountWorkspaceEntity;

      const mockRepository = { update: jest.fn() };

      jest.spyOn(service, 'checkAccessTokenValidity').mockResolvedValue(false);
      jest
        .spyOn(googleAPIRefreshAccessTokenService, 'refreshAccessToken')
        .mockResolvedValue({ accessToken: mockNewAccessToken });
      jest
        .spyOn(twentyORMManager, 'getRepository')
        .mockResolvedValue(mockRepository as any);

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual({ accessToken: mockNewAccessToken });
      expect(
        googleAPIRefreshAccessTokenService.refreshAccessToken,
      ).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: mockConnectedAccountId },
        { accessToken: mockNewAccessToken },
      );
    });

    it('should refresh and save new Microsoft token when expired', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      } as ConnectedAccountWorkspaceEntity;

      const mockRepository = { update: jest.fn() };

      jest.spyOn(service, 'checkAccessTokenValidity').mockResolvedValue(false);
      jest
        .spyOn(microsoftAPIRefreshAccessTokenService, 'refreshTokens')
        .mockResolvedValue({ accessToken: mockNewAccessToken });
      jest
        .spyOn(twentyORMManager, 'getRepository')
        .mockResolvedValue(mockRepository as any);

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual({ accessToken: mockNewAccessToken });
      expect(
        microsoftAPIRefreshAccessTokenService.refreshTokens,
      ).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: mockConnectedAccountId },
        { accessToken: mockNewAccessToken },
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

    it('should throw when Google refresh fails with axios error', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
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

      jest.spyOn(service, 'checkAccessTokenValidity').mockResolvedValue(false);
      jest
        .spyOn(googleAPIRefreshAccessTokenService, 'refreshAccessToken')
        .mockRejectedValue(axiosError);

      await expect(
        service.refreshAndSaveTokens(connectedAccount, mockWorkspaceId),
      ).rejects.toThrow(ConnectedAccountRefreshAccessTokenException);
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

      jest.spyOn(service, 'checkAccessTokenValidity').mockResolvedValue(false);
      jest
        .spyOn(microsoftAPIRefreshAccessTokenService, 'refreshTokens')
        .mockRejectedValue(axiosError);

      await expect(
        service.refreshAndSaveTokens(connectedAccount, mockWorkspaceId),
      ).rejects.toThrow(ConnectedAccountRefreshAccessTokenException);
    });
  });
});
