import { ConnectedAccountProvider } from 'twenty-shared/types';
import { Repository, type UpdateResult } from 'typeorm';

import { AppOAuthRefreshAccessTokenService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-refresh-tokens.service';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountRefreshAccessTokenException } from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { GoogleApiRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';
import { MicrosoftApiRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

describe('ConnectedAccountRefreshTokensService', () => {
  let service: ConnectedAccountRefreshTokensService;
  let mockGoogleService: jest.Mocked<
    Partial<GoogleApiRefreshAccessTokenService>
  >;
  let mockMicrosoftService: jest.Mocked<
    Partial<MicrosoftApiRefreshAccessTokenService>
  >;
  let mockAppOAuthService: jest.Mocked<
    Partial<AppOAuthRefreshAccessTokenService>
  >;
  let mockEncryptionService: jest.Mocked<
    Partial<ConnectedAccountTokenEncryptionService>
  >;
  let mockRepository: jest.Mocked<Partial<Repository<ConnectedAccountEntity>>>;

  beforeEach(() => {
    mockGoogleService = { refreshTokens: jest.fn() };
    mockMicrosoftService = { refreshTokens: jest.fn() };
    mockAppOAuthService = { refreshTokens: jest.fn() };
    mockEncryptionService = {
      decrypt: jest.fn(
        ({ ciphertext }) => ciphertext.replace('enc:', '') as PlaintextString,
      ),
      encryptTokenPair: jest.fn(({ accessToken, refreshToken }) => ({
        encryptedAccessToken: `enc:${accessToken}` as EncryptedString,
        encryptedRefreshToken: refreshToken
          ? (`enc:${refreshToken}` as EncryptedString)
          : null,
      })),
    };
    mockRepository = {
      update: jest.fn().mockResolvedValue({} as unknown as UpdateResult),
    };

    service = new ConnectedAccountRefreshTokensService(
      mockGoogleService as GoogleApiRefreshAccessTokenService,
      mockMicrosoftService as MicrosoftApiRefreshAccessTokenService,
      mockAppOAuthService as AppOAuthRefreshAccessTokenService,
      mockEncryptionService as ConnectedAccountTokenEncryptionService,
      mockRepository as Repository<ConnectedAccountEntity>,
    );
  });

  describe('isAccessTokenStillValid', () => {
    it('returns true when connected account has no refreshToken for APP provider', async () => {
      const account = {
        provider: ConnectedAccountProvider.APP,
        refreshToken: null,
      } as ConnectedAccountEntity;

      expect(await service.isAccessTokenStillValid(account)).toBe(true);
    });

    it('returns false when lastCredentialsRefreshedAt is null', async () => {
      const account = {
        provider: ConnectedAccountProvider.APP,
        refreshToken: 'enc:refresh' as EncryptedString,
        lastCredentialsRefreshedAt: null,
      } as ConnectedAccountEntity;

      expect(await service.isAccessTokenStillValid(account)).toBe(false);
    });

    it('considers short-lived token valid when within lifetime and outside safety margin', async () => {
      const now = Date.now();
      const lastCredentialsRefreshedAt = new Date(now - 60 * 1000); // refreshed 1 minute ago
      const accessTokenExpiresAt = new Date(now + 240 * 1000); // 300s total lifetime (expires in 4 minutes)

      const account = {
        provider: ConnectedAccountProvider.APP,
        refreshToken: 'enc:refresh' as EncryptedString,
        lastCredentialsRefreshedAt,
        accessTokenExpiresAt,
      } as ConnectedAccountEntity;

      expect(await service.isAccessTokenStillValid(account)).toBe(true);
    });

    it('considers short-lived token expired when within safety margin', async () => {
      const now = Date.now();
      // Total lifetime 300s, safety margin is 10% = 30s. Expires in 10s => within margin!
      const lastCredentialsRefreshedAt = new Date(now - 290 * 1000);
      const accessTokenExpiresAt = new Date(now + 10 * 1000);

      const account = {
        provider: ConnectedAccountProvider.APP,
        refreshToken: 'enc:refresh' as EncryptedString,
        lastCredentialsRefreshedAt,
        accessTokenExpiresAt,
      } as ConnectedAccountEntity;

      expect(await service.isAccessTokenStillValid(account)).toBe(false);
    });

    it('considers token expired when accessTokenExpiresAt has passed', async () => {
      const now = Date.now();
      const lastCredentialsRefreshedAt = new Date(now - 400 * 1000);
      const accessTokenExpiresAt = new Date(now - 100 * 1000);

      const account = {
        provider: ConnectedAccountProvider.APP,
        refreshToken: 'enc:refresh' as EncryptedString,
        lastCredentialsRefreshedAt,
        accessTokenExpiresAt,
      } as ConnectedAccountEntity;

      expect(await service.isAccessTokenStillValid(account)).toBe(false);
    });

    it('falls back to 1 hour default with 5m buffer when accessTokenExpiresAt is not set', async () => {
      const now = Date.now();
      // Refreshed 30 minutes ago without explicit expiresAt (valid under 55m threshold)
      const validAccount = {
        provider: ConnectedAccountProvider.APP,
        refreshToken: 'enc:refresh' as EncryptedString,
        lastCredentialsRefreshedAt: new Date(now - 30 * 60 * 1000),
        accessTokenExpiresAt: null,
      } as ConnectedAccountEntity;

      expect(await service.isAccessTokenStillValid(validAccount)).toBe(true);

      // Refreshed 56 minutes ago (expired under 55m threshold)
      const expiredAccount = {
        provider: ConnectedAccountProvider.APP,
        refreshToken: 'enc:refresh' as EncryptedString,
        lastCredentialsRefreshedAt: new Date(now - 56 * 60 * 1000),
        accessTokenExpiresAt: null,
      } as ConnectedAccountEntity;

      expect(await service.isAccessTokenStillValid(expiredAccount)).toBe(false);
    });

    it('caps safety margin at 5 minutes for long-lived tokens', async () => {
      const now = Date.now();
      // 24 hour token: 10% would be 2.4 hours, but capped at 5 minutes
      const lastCredentialsRefreshedAt = new Date(now - 23 * 60 * 60 * 1000);
      // Expires in 6 minutes: since safety margin is capped at 5 minutes, it is still valid!
      const stillValidAccount = {
        provider: ConnectedAccountProvider.APP,
        refreshToken: 'enc:refresh' as EncryptedString,
        lastCredentialsRefreshedAt,
        accessTokenExpiresAt: new Date(now + 6 * 60 * 1000),
      } as ConnectedAccountEntity;

      expect(await service.isAccessTokenStillValid(stillValidAccount)).toBe(
        true,
      );

      // Expires in 4 minutes: within 5-minute capped safety margin => expired!
      const expiringSoonAccount = {
        provider: ConnectedAccountProvider.APP,
        refreshToken: 'enc:refresh' as EncryptedString,
        lastCredentialsRefreshedAt,
        accessTokenExpiresAt: new Date(now + 4 * 60 * 1000),
      } as ConnectedAccountEntity;

      expect(await service.isAccessTokenStillValid(expiringSoonAccount)).toBe(
        false,
      );
    });

    it('returns false when dates are invalid or NaN', async () => {
      const accountWithInvalidExpiresAt = {
        provider: ConnectedAccountProvider.APP,
        refreshToken: 'enc:refresh' as EncryptedString,
        lastCredentialsRefreshedAt: new Date(),
        accessTokenExpiresAt: new Date('invalid-date'),
      } as ConnectedAccountEntity;

      expect(
        await service.isAccessTokenStillValid(accountWithInvalidExpiresAt),
      ).toBe(false);
    });
  });

  describe('resolveTokens', () => {
    it('returns existing tokens without refreshing when token is still valid', async () => {
      const account = {
        id: 'acc-1',
        provider: ConnectedAccountProvider.APP,
        accessToken: 'enc:existing_access' as EncryptedString,
        refreshToken: 'enc:existing_refresh' as EncryptedString,
        lastCredentialsRefreshedAt: new Date(),
        accessTokenExpiresAt: new Date(Date.now() + 300 * 1000),
      } as ConnectedAccountEntity;

      const tokens = await service.resolveTokens(account, 'ws-1');

      expect(tokens).toEqual({
        accessToken: 'enc:existing_access',
        refreshToken: 'enc:existing_refresh',
      });
      expect(mockAppOAuthService.refreshTokens).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('refreshes and persists new tokens and accessTokenExpiresAt when token has expired', async () => {
      const account = {
        id: 'acc-1',
        provider: ConnectedAccountProvider.APP,
        accessToken: 'enc:expired_access' as EncryptedString,
        refreshToken: 'enc:valid_refresh' as EncryptedString,
        lastCredentialsRefreshedAt: new Date(Date.now() - 400 * 1000),
        accessTokenExpiresAt: new Date(Date.now() - 100 * 1000),
      } as ConnectedAccountEntity;

      mockAppOAuthService.refreshTokens!.mockResolvedValue({
        accessToken: 'new_fresh_access' as PlaintextString,
        refreshToken: 'new_fresh_refresh' as PlaintextString,
        expiresIn: 300,
      });

      const tokens = await service.resolveTokens(account, 'ws-1');

      expect(mockAppOAuthService.refreshTokens).toHaveBeenCalledWith(
        account,
        'valid_refresh',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: 'acc-1', workspaceId: 'ws-1' },
        expect.objectContaining({
          accessToken: 'enc:new_fresh_access',
          refreshToken: 'enc:new_fresh_refresh',
          accessTokenExpiresAt: expect.any(Date),
        }),
      );
      expect(tokens).toEqual({
        accessToken: 'enc:new_fresh_access',
        refreshToken: 'enc:new_fresh_refresh',
      });
    });

    it('throws when refreshing an expired account that has no refreshToken', async () => {
      const account = {
        id: 'acc-1',
        provider: ConnectedAccountProvider.GOOGLE,
        accessToken: 'enc:expired_access' as EncryptedString,
        refreshToken: null,
        lastCredentialsRefreshedAt: new Date(Date.now() - 400 * 1000),
        accessTokenExpiresAt: new Date(Date.now() - 100 * 1000),
      } as ConnectedAccountEntity;

      await expect(service.resolveTokens(account, 'ws-1')).rejects.toThrow(
        ConnectedAccountRefreshAccessTokenException,
      );
    });
  });
});
