import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';
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
  let globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;

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
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getRepository: jest.fn(),
            executeInWorkspaceContext: jest
              .fn()

              .mockImplementation((_authContext: any, fn: () => any) => fn()),
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
    globalWorkspaceOrmManager = module.get<GlobalWorkspaceOrmManager>(
      GlobalWorkspaceOrmManager,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshAndSaveTokens', () => {
    it('should reuse valid access token without refreshing when lastCredentialsRefreshedAt is recent', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        lastCredentialsRefreshedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      } as ConnectedAccountWorkspaceEntity;

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
      expect(globalWorkspaceOrmManager.getRepository).not.toHaveBeenCalled();
    });

    it('should refresh and save new Microsoft token when expired (lastCredentialsRefreshedAt is old)', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      } as ConnectedAccountWorkspaceEntity;

      const mockRepository = { update: jest.fn() };
      const newTokens = {
        accessToken: mockNewAccessToken,
        refreshToken: mockRefreshToken,
      };

      jest
        .spyOn(microsoftAPIRefreshAccessTokenService, 'refreshTokens')
        .mockResolvedValue(newTokens);
      jest
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
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
        expect.objectContaining({
          ...newTokens,
          lastCredentialsRefreshedAt: expect.any(Date),
        }),
      );
    });

    it('should refresh and save new Google token when expired (lastCredentialsRefreshedAt is old)', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      } as ConnectedAccountWorkspaceEntity;

      const mockRepository = { update: jest.fn() };
      const newTokens = {
        accessToken: mockNewAccessToken,
        refreshToken: mockRefreshToken,
      };

      jest
        .spyOn(googleAPIRefreshAccessTokenService, 'refreshTokens')
        .mockResolvedValue(newTokens);
      jest
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
        .mockResolvedValue(mockRepository as any);

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual(newTokens);
      expect(
        googleAPIRefreshAccessTokenService.refreshTokens,
      ).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: mockConnectedAccountId },
        expect.objectContaining({
          ...newTokens,
          lastCredentialsRefreshedAt: expect.any(Date),
        }),
      );
    });

    it('should refresh token when lastCredentialsRefreshedAt is null', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        lastCredentialsRefreshedAt: null,
      } as ConnectedAccountWorkspaceEntity;

      const mockRepository = { update: jest.fn() };
      const newTokens = {
        accessToken: mockNewAccessToken,
        refreshToken: mockRefreshToken,
      };

      jest
        .spyOn(microsoftAPIRefreshAccessTokenService, 'refreshTokens')
        .mockResolvedValue(newTokens);
      jest
        .spyOn(globalWorkspaceOrmManager, 'getRepository')
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
        expect.objectContaining({
          ...newTokens,
          lastCredentialsRefreshedAt: expect.any(Date),
        }),
      );
    });

    it('should throw when refresh token is missing', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
        accessToken: mockAccessToken,
        refreshToken: null,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
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

    it('should throw exception when Microsoft refresh fails with invalid_grant', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      } as ConnectedAccountWorkspaceEntity;

      const invalidGrantError = new ConnectedAccountRefreshAccessTokenException(
        'Microsoft OAuth error: invalid_grant - Token has been revoked',
        ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );

      jest
        .spyOn(microsoftAPIRefreshAccessTokenService, 'refreshTokens')
        .mockRejectedValue(invalidGrantError);

      await expect(
        service.refreshAndSaveTokens(connectedAccount, mockWorkspaceId),
      ).rejects.toMatchObject({
        message: expect.stringContaining(
          'Microsoft OAuth error: invalid_grant - Token has been revoked',
        ),
        code: ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      });
    });

    it('should throw TEMPORARY_NETWORK_ERROR when refresh fails with network error', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      } as ConnectedAccountWorkspaceEntity;

      const networkError = new Error('Network error');

      (networkError as any).code = 'ECONNRESET';

      jest
        .spyOn(googleAPIRefreshAccessTokenService, 'refreshTokens')
        .mockRejectedValue(networkError);

      await expect(
        service.refreshAndSaveTokens(connectedAccount, mockWorkspaceId),
      ).rejects.toMatchObject({
        code: ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
      });
    });
  });

  describe('isAccessTokenStillValid', () => {
    it('should return true when lastCredentialsRefreshedAt is within the valid window (30 minutes ago)', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        lastCredentialsRefreshedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      } as ConnectedAccountWorkspaceEntity;

      const result = await service.isAccessTokenStillValid(connectedAccount);

      expect(result).toBe(true);
    });

    it('should return false when lastCredentialsRefreshedAt is outside the valid window (2 hours ago)', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      } as ConnectedAccountWorkspaceEntity;

      const result = await service.isAccessTokenStillValid(connectedAccount);

      expect(result).toBe(false);
    });

    it('should return false when lastCredentialsRefreshedAt is null', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        lastCredentialsRefreshedAt: null,
      } as ConnectedAccountWorkspaceEntity;

      const result = await service.isAccessTokenStillValid(connectedAccount);

      expect(result).toBe(false);
    });

    it('should return true for IMAP_SMTP_CALDAV provider regardless of lastCredentialsRefreshedAt', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        lastCredentialsRefreshedAt: null,
      } as ConnectedAccountWorkspaceEntity;

      const result = await service.isAccessTokenStillValid(connectedAccount);

      expect(result).toBe(true);
    });
  });
});
