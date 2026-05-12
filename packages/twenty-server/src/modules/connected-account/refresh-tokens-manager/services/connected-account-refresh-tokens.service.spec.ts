import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { AppOAuthRefreshAccessTokenService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-refresh-tokens.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX,
  ConnectedAccountTokenEncryptionService,
} from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';
import { MicrosoftAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';

import { ConnectedAccountRefreshTokensService } from './connected-account-refresh-tokens.service';

describe('ConnectedAccountRefreshTokensService', () => {
  let service: ConnectedAccountRefreshTokensService;
  let googleAPIRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService;
  let microsoftAPIRefreshAccessTokenService: MicrosoftAPIRefreshAccessTokenService;
  let connectedAccountRepository: { update: jest.Mock };
  let connectedAccountTokenEncryptionService: {
    decrypt: jest.Mock;
    encryptTokenPair: jest.Mock;
  };

  const mockWorkspaceId = 'workspace-123';
  const mockConnectedAccountId = 'account-456';

  const mockAccessTokenPlaintext = 'valid-access-token';
  const mockRefreshTokenPlaintext = 'valid-refresh-token';
  const mockNewAccessTokenPlaintext = 'new-access-token';

  const mockEncryptedAccessToken = `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(${mockAccessTokenPlaintext})`;
  const mockEncryptedRefreshToken = `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(${mockRefreshTokenPlaintext})`;

  // Real prefix/round-trip invariants are asserted in
  // connected-account-token-encryption.service.spec.ts.
  const buildSymmetricEncryptionStub = (): {
    decrypt: jest.Mock;
    encryptTokenPair: jest.Mock;
  } => {
    const wrap = (value: string) =>
      `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(${value})`;

    return {
      decrypt: jest.fn((value: string) => {
        const match = value.match(
          new RegExp(
            `^${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER\\((.*)\\)$`,
          ),
        );

        if (match === null) {
          throw new Error(
            `fake encryption stub: decrypt called with a non-CIPHER value: ${value}`,
          );
        }

        return match[1];
      }),
      encryptTokenPair: jest.fn(
        ({
          accessToken,
          refreshToken,
        }: {
          accessToken: string;
          refreshToken: string | null;
        }) => ({
          encryptedAccessToken: wrap(accessToken),
          encryptedRefreshToken:
            refreshToken === null ? null : wrap(refreshToken),
        }),
      ),
    };
  };

  beforeEach(async () => {
    connectedAccountTokenEncryptionService = buildSymmetricEncryptionStub();

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
          provide: AppOAuthRefreshAccessTokenService,
          useValue: {
            refreshTokens: jest.fn(),
          },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest
              .fn()

              .mockImplementation((fn: () => any, _authContext?: any) => fn()),
          },
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: ConnectedAccountTokenEncryptionService,
          useValue: connectedAccountTokenEncryptionService,
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
    connectedAccountRepository = module.get(
      getRepositoryToken(ConnectedAccountEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshAndSaveTokens', () => {
    it('should reuse the cached token, decrypt before returning to the caller, and skip the refresh call entirely', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockEncryptedAccessToken,
        refreshToken: mockEncryptedRefreshToken,
        lastCredentialsRefreshedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      } as ConnectedAccountEntity;

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual({
        accessToken: mockAccessTokenPlaintext,
        refreshToken: mockRefreshTokenPlaintext,
      });
      expect(
        connectedAccountTokenEncryptionService.decrypt,
      ).toHaveBeenCalledWith(mockEncryptedAccessToken);
      expect(
        connectedAccountTokenEncryptionService.decrypt,
      ).toHaveBeenCalledWith(mockEncryptedRefreshToken);
      expect(
        microsoftAPIRefreshAccessTokenService.refreshTokens,
      ).not.toHaveBeenCalled();
      expect(connectedAccountRepository.update).not.toHaveBeenCalled();
    });

    it('should decrypt the stored refresh token before sending to Microsoft, then re-encrypt the rotated tokens before persisting', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockEncryptedAccessToken,
        refreshToken: mockEncryptedRefreshToken,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      } as ConnectedAccountEntity;

      const newTokens = {
        accessToken: mockNewAccessTokenPlaintext,
        refreshToken: mockRefreshTokenPlaintext,
      };

      jest
        .spyOn(microsoftAPIRefreshAccessTokenService, 'refreshTokens')
        .mockResolvedValue(newTokens);

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual(newTokens);
      expect(
        microsoftAPIRefreshAccessTokenService.refreshTokens,
      ).toHaveBeenCalledWith(mockRefreshTokenPlaintext);
      expect(connectedAccountRepository.update).toHaveBeenCalledWith(
        { id: mockConnectedAccountId, workspaceId: mockWorkspaceId },
        expect.objectContaining({
          accessToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(${mockNewAccessTokenPlaintext})`,
          refreshToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(${mockRefreshTokenPlaintext})`,
          lastCredentialsRefreshedAt: expect.any(Date),
        }),
      );
    });

    it('should decrypt the stored refresh token before sending to Google, then re-encrypt the rotated tokens before persisting', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
        accessToken: mockEncryptedAccessToken,
        refreshToken: mockEncryptedRefreshToken,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      } as ConnectedAccountEntity;

      const newTokens = {
        accessToken: mockNewAccessTokenPlaintext,
        refreshToken: mockRefreshTokenPlaintext,
      };

      jest
        .spyOn(googleAPIRefreshAccessTokenService, 'refreshTokens')
        .mockResolvedValue(newTokens);

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual(newTokens);
      expect(
        googleAPIRefreshAccessTokenService.refreshTokens,
      ).toHaveBeenCalledWith(mockRefreshTokenPlaintext);
      expect(connectedAccountRepository.update).toHaveBeenCalledWith(
        { id: mockConnectedAccountId, workspaceId: mockWorkspaceId },
        expect.objectContaining({
          accessToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(${mockNewAccessTokenPlaintext})`,
          refreshToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(${mockRefreshTokenPlaintext})`,
          lastCredentialsRefreshedAt: expect.any(Date),
        }),
      );
    });

    it('should treat null lastCredentialsRefreshedAt as expired and run the full decrypt → refresh → re-encrypt cycle', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        accessToken: mockEncryptedAccessToken,
        refreshToken: mockEncryptedRefreshToken,
        lastCredentialsRefreshedAt: null,
      } as ConnectedAccountEntity;

      const newTokens = {
        accessToken: mockNewAccessTokenPlaintext,
        refreshToken: mockRefreshTokenPlaintext,
      };

      jest
        .spyOn(microsoftAPIRefreshAccessTokenService, 'refreshTokens')
        .mockResolvedValue(newTokens);

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual(newTokens);
      expect(
        microsoftAPIRefreshAccessTokenService.refreshTokens,
      ).toHaveBeenCalledWith(mockRefreshTokenPlaintext);
      expect(connectedAccountRepository.update).toHaveBeenCalledWith(
        { id: mockConnectedAccountId, workspaceId: mockWorkspaceId },
        expect.objectContaining({
          accessToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(${mockNewAccessTokenPlaintext})`,
          refreshToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(${mockRefreshTokenPlaintext})`,
          lastCredentialsRefreshedAt: expect.any(Date),
        }),
      );
    });

    it('should throw when refresh token is missing', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
        accessToken: mockEncryptedAccessToken,
        refreshToken: null,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      } as unknown as ConnectedAccountEntity;

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
        accessToken: mockEncryptedAccessToken,
        refreshToken: mockEncryptedRefreshToken,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      } as ConnectedAccountEntity;

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
        accessToken: mockEncryptedAccessToken,
        refreshToken: mockEncryptedRefreshToken,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      } as ConnectedAccountEntity;

      const networkError = new ConnectedAccountRefreshAccessTokenException(
        'Google refresh token network error: ECONNRESET - Network error',
        ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
      );

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
      } as ConnectedAccountEntity;

      const result = await service.isAccessTokenStillValid(connectedAccount);

      expect(result).toBe(true);
    });

    it('should return false when lastCredentialsRefreshedAt is outside the valid window (2 hours ago)', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.GOOGLE,
        lastCredentialsRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      } as ConnectedAccountEntity;

      const result = await service.isAccessTokenStillValid(connectedAccount);

      expect(result).toBe(false);
    });

    it('should return false when lastCredentialsRefreshedAt is null', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.MICROSOFT,
        lastCredentialsRefreshedAt: null,
      } as ConnectedAccountEntity;

      const result = await service.isAccessTokenStillValid(connectedAccount);

      expect(result).toBe(false);
    });

    it('should return true for IMAP_SMTP_CALDAV provider regardless of lastCredentialsRefreshedAt', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        lastCredentialsRefreshedAt: null,
      } as ConnectedAccountEntity;

      const result = await service.isAccessTokenStillValid(connectedAccount);

      expect(result).toBe(true);
    });

    it('should return true for OIDC provider regardless of lastCredentialsRefreshedAt', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.OIDC,
        lastCredentialsRefreshedAt: null,
      } as ConnectedAccountEntity;

      const result = await service.isAccessTokenStillValid(connectedAccount);

      expect(result).toBe(true);
    });

    it('should return true for SAML provider regardless of lastCredentialsRefreshedAt', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.SAML,
        lastCredentialsRefreshedAt: null,
      } as ConnectedAccountEntity;

      const result = await service.isAccessTokenStillValid(connectedAccount);

      expect(result).toBe(true);
    });
  });

  describe('refreshAndSaveTokens - OIDC/SAML', () => {
    it('should decrypt and return existing tokens for OIDC without attempting a refresh', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.OIDC,
        accessToken: mockEncryptedAccessToken,
        refreshToken: mockEncryptedRefreshToken,
        lastCredentialsRefreshedAt: null,
      } as unknown as ConnectedAccountEntity;

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual({
        accessToken: mockAccessTokenPlaintext,
        refreshToken: mockRefreshTokenPlaintext,
      });
      expect(
        googleAPIRefreshAccessTokenService.refreshTokens,
      ).not.toHaveBeenCalled();
      expect(
        microsoftAPIRefreshAccessTokenService.refreshTokens,
      ).not.toHaveBeenCalled();
      expect(connectedAccountRepository.update).not.toHaveBeenCalled();
    });

    it('should decrypt and return existing tokens for SAML without attempting a refresh', async () => {
      const connectedAccount = {
        id: mockConnectedAccountId,
        provider: ConnectedAccountProvider.SAML,
        accessToken: mockEncryptedAccessToken,
        refreshToken: mockEncryptedRefreshToken,
        lastCredentialsRefreshedAt: null,
      } as unknown as ConnectedAccountEntity;

      const result = await service.refreshAndSaveTokens(
        connectedAccount,
        mockWorkspaceId,
      );

      expect(result).toEqual({
        accessToken: mockAccessTokenPlaintext,
        refreshToken: mockRefreshTokenPlaintext,
      });
      expect(
        googleAPIRefreshAccessTokenService.refreshTokens,
      ).not.toHaveBeenCalled();
      expect(
        microsoftAPIRefreshAccessTokenService.refreshTokens,
      ).not.toHaveBeenCalled();
      expect(connectedAccountRepository.update).not.toHaveBeenCalled();
    });
  });
});
