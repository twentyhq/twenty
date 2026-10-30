import { ConnectedAccountProvider } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type AppOAuthRefreshAccessTokenService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-refresh-tokens.service';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { type GoogleApiRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';
import { type MicrosoftApiRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

const NOW = new Date('2026-10-30T12:00:00.000Z');
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const ONE_YEAR_SECONDS = 365 * 24 * 3600;

const EXISTING_CLAIMS = {
  sub: 'legacy-user',
  email: 'legacy@example.com',
  iss: 'https://hydra.example',
};

describe('ConnectedAccountRefreshTokensService', () => {
  let googleRefreshTokens: jest.Mock;
  let microsoftRefreshTokens: jest.Mock;
  let appRefreshTokens: jest.Mock;
  let decrypt: jest.Mock;
  let encryptTokenPair: jest.Mock;
  let update: jest.Mock;
  let service: ConnectedAccountRefreshTokensService;

  const refreshedAgo = (ageMs: number): Date =>
    new Date(NOW.getTime() - ageMs);

  const buildAccount = (
    overrides: Partial<ConnectedAccountEntity> = {},
  ): ConnectedAccountEntity =>
    ({
      id: 'account-1111',
      workspaceId: 'workspace-2222',
      provider: ConnectedAccountProvider.GOOGLE,
      accessToken: 'enc-access' as EncryptedString,
      refreshToken: 'enc-refresh' as EncryptedString,
      lastCredentialsRefreshedAt: NOW,
      oidcTokenClaims: null,
      connectionProviderId: 'provider-1',
      ...overrides,
    }) as ConnectedAccountEntity;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);

    googleRefreshTokens = jest.fn().mockResolvedValue({
      accessToken: 'google-access' as PlaintextString,
      refreshToken: 'google-refresh' as PlaintextString,
    });
    microsoftRefreshTokens = jest.fn().mockResolvedValue({
      accessToken: 'microsoft-access' as PlaintextString,
      refreshToken: 'microsoft-refresh' as PlaintextString,
    });
    appRefreshTokens = jest.fn().mockResolvedValue({
      accessToken: 'hydra-access' as PlaintextString,
      refreshToken: 'hydra-refresh' as PlaintextString,
      expiresIn: 300,
    });
    decrypt = jest.fn().mockReturnValue('plain-refresh' as PlaintextString);
    encryptTokenPair = jest.fn().mockReturnValue({
      encryptedAccessToken: 'enc-new-access' as EncryptedString,
      encryptedRefreshToken: 'enc-new-refresh' as EncryptedString,
    });
    update = jest.fn().mockResolvedValue({ affected: 1 });

    service = new ConnectedAccountRefreshTokensService(
      { refreshTokens: googleRefreshTokens } as unknown as GoogleApiRefreshAccessTokenService,
      {
        refreshTokens: microsoftRefreshTokens,
      } as unknown as MicrosoftApiRefreshAccessTokenService,
      {
        refreshTokens: appRefreshTokens,
      } as unknown as AppOAuthRefreshAccessTokenService,
      {
        decrypt,
        encryptTokenPair,
      } as unknown as ConnectedAccountTokenEncryptionService,
      { update } as unknown as Repository<ConnectedAccountEntity>,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const expectReused = async (account: ConnectedAccountEntity) => {
    const tokens = await service.resolveTokens(account, account.workspaceId);

    expect(tokens).toEqual({
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
    });
    expect(googleRefreshTokens).not.toHaveBeenCalled();
    expect(microsoftRefreshTokens).not.toHaveBeenCalled();
    expect(appRefreshTokens).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  };

  const refreshDriverFor = (provider: ConnectedAccountProvider): jest.Mock => {
    if (provider === ConnectedAccountProvider.GOOGLE) {
      return googleRefreshTokens;
    }

    if (provider === ConnectedAccountProvider.MICROSOFT) {
      return microsoftRefreshTokens;
    }

    return appRefreshTokens;
  };

  describe('55 minute fallback', () => {
    it.each([
      ConnectedAccountProvider.GOOGLE,
      ConnectedAccountProvider.MICROSOFT,
      ConnectedAccountProvider.APP,
    ])(
      'reuses a %s token that was refreshed 54 minutes ago when no provider TTL is stored',
      async (provider) => {
        const account = buildAccount({
          provider,
          oidcTokenClaims: null,
          lastCredentialsRefreshedAt: refreshedAgo(54 * MINUTE),
        });

        await expect(service.isAccessTokenStillValid(account)).resolves.toBe(
          true,
        );
        await expectReused(account);
      },
    );

    it.each([
      ConnectedAccountProvider.GOOGLE,
      ConnectedAccountProvider.MICROSOFT,
    ])(
      'refreshes a %s token at 56 minutes and does not write oidcTokenClaims',
      async (provider) => {
        const account = buildAccount({
          provider,
          oidcTokenClaims: { ...EXISTING_CLAIMS },
          lastCredentialsRefreshedAt: refreshedAgo(56 * MINUTE),
        });

        await expect(service.isAccessTokenStillValid(account)).resolves.toBe(
          false,
        );

        await service.resolveTokens(account, account.workspaceId);

        expect(refreshDriverFor(provider)).toHaveBeenCalledTimes(1);
        expect(update).toHaveBeenCalledWith(
          { id: account.id, workspaceId: account.workspaceId },
          {
            accessToken: 'enc-new-access',
            refreshToken: 'enc-new-refresh',
            lastCredentialsRefreshedAt: new Date(NOW),
          },
        );
        expect(update.mock.calls[0][1]).not.toHaveProperty('oidcTokenClaims');
      },
    );

    it('treats exactly 55 minutes as expired, matching the old strict comparison', async () => {
      const account = buildAccount({
        oidcTokenClaims: null,
        lastCredentialsRefreshedAt: refreshedAgo(55 * MINUTE),
      });

      await expect(service.isAccessTokenStillValid(account)).resolves.toBe(
        false,
      );
    });

    it.each([
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      0,
      -1,
      ONE_YEAR_SECONDS + 1,
      '300',
      '',
      null,
    ])(
      'keeps the 55 minute window when stored expiresIn is %p',
      async (expiresIn) => {
        const freshEnough = buildAccount({
          provider: ConnectedAccountProvider.APP,
          oidcTokenClaims: { ...EXISTING_CLAIMS, expiresIn },
          lastCredentialsRefreshedAt: refreshedAgo(54 * MINUTE),
        });
        const tooOld = buildAccount({
          provider: ConnectedAccountProvider.APP,
          oidcTokenClaims: { ...EXISTING_CLAIMS, expiresIn },
          lastCredentialsRefreshedAt: refreshedAgo(56 * MINUTE),
        });

        await expect(
          service.isAccessTokenStillValid(freshEnough),
        ).resolves.toBe(true);
        await expect(service.isAccessTokenStillValid(tooOld)).resolves.toBe(
          false,
        );
      },
    );

    it('uses the same 55 minute window when the provider TTL is 3600 seconds', async () => {
      const withinBuffer = buildAccount({
        oidcTokenClaims: { expiresIn: 3600 },
        lastCredentialsRefreshedAt: refreshedAgo(54 * MINUTE),
      });
      const pastBuffer = buildAccount({
        oidcTokenClaims: { expiresIn: 3600 },
        lastCredentialsRefreshedAt: refreshedAgo(56 * MINUTE),
      });

      await expect(
        service.isAccessTokenStillValid(withinBuffer),
      ).resolves.toBe(true);
      await expect(service.isAccessTokenStillValid(pastBuffer)).resolves.toBe(
        false,
      );
    });
  });

  describe('Ory Hydra 300 second TTL', () => {
    const hydraAccount = (ageMs: number): ConnectedAccountEntity =>
      buildAccount({
        provider: ConnectedAccountProvider.APP,
        oidcTokenClaims: { ...EXISTING_CLAIMS, expiresIn: 300 },
        lastCredentialsRefreshedAt: refreshedAgo(ageMs),
      });

    it('reuses the access token at 239 seconds', async () => {
      const account = hydraAccount(239 * SECOND);

      await expect(service.isAccessTokenStillValid(account)).resolves.toBe(
        true,
      );
      await expectReused(account);
    });

    it('refreshes at 240 seconds and merges expiresIn onto the existing claims', async () => {
      const account = hydraAccount(240 * SECOND);

      await expect(service.isAccessTokenStillValid(account)).resolves.toBe(
        false,
      );

      await service.resolveTokens(account, account.workspaceId);

      expect(appRefreshTokens).toHaveBeenCalledWith(account, 'plain-refresh');
      expect(googleRefreshTokens).not.toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith(
        { id: account.id, workspaceId: account.workspaceId },
        {
          accessToken: 'enc-new-access',
          refreshToken: 'enc-new-refresh',
          lastCredentialsRefreshedAt: new Date(NOW),
          oidcTokenClaims: {
            ...EXISTING_CLAIMS,
            expiresIn: 300,
          },
        },
      );
    });

    it('self-heals a legacy account on the next refresh, then follows the 240 second window', async () => {
      const account = buildAccount({
        provider: ConnectedAccountProvider.APP,
        oidcTokenClaims: { ...EXISTING_CLAIMS },
        lastCredentialsRefreshedAt: refreshedAgo(56 * MINUTE),
      });

      await service.resolveTokens(account, account.workspaceId);

      const firstPatch = update.mock.calls[0][1] as {
        accessToken: EncryptedString;
        refreshToken: EncryptedString;
        lastCredentialsRefreshedAt: Date;
        oidcTokenClaims: Record<string, unknown>;
      };

      expect(firstPatch.oidcTokenClaims).toEqual({
        ...EXISTING_CLAIMS,
        expiresIn: 300,
      });

      account.oidcTokenClaims = firstPatch.oidcTokenClaims;
      account.lastCredentialsRefreshedAt = firstPatch.lastCredentialsRefreshedAt;
      account.accessToken = firstPatch.accessToken;
      account.refreshToken = firstPatch.refreshToken;

      appRefreshTokens.mockClear();
      update.mockClear();

      jest.setSystemTime(NOW.getTime() + 239 * SECOND);
      await expectReused(account);

      jest.setSystemTime(NOW.getTime() + 240 * SECOND);
      await service.resolveTokens(account, account.workspaceId);

      expect(appRefreshTokens).toHaveBeenCalledTimes(1);
      expect(update.mock.calls[0][1].oidcTokenClaims).toEqual({
        ...EXISTING_CLAIMS,
        expiresIn: 300,
      });
    });

    it('leaves the jsonb column out of the update when the refresh response has no expires_in', async () => {
      appRefreshTokens.mockResolvedValue({
        accessToken: 'hydra-access' as PlaintextString,
        refreshToken: 'hydra-refresh' as PlaintextString,
        expiresIn: null,
      });

      const account = hydraAccount(240 * SECOND);

      await service.resolveTokens(account, account.workspaceId);

      expect(update.mock.calls[0][1]).not.toHaveProperty('oidcTokenClaims');
    });

    it.each([Number.POSITIVE_INFINITY, Number.NaN, 0, -5, ONE_YEAR_SECONDS + 1])(
      'does not persist illegal refresh expiresIn %p',
      async (expiresIn) => {
        appRefreshTokens.mockResolvedValue({
          accessToken: 'hydra-access' as PlaintextString,
          refreshToken: 'hydra-refresh' as PlaintextString,
          expiresIn,
        });

        const account = hydraAccount(240 * SECOND);

        await service.resolveTokens(account, account.workspaceId);

        expect(update.mock.calls[0][1]).not.toHaveProperty('oidcTokenClaims');
      },
    );
  });

  it('keeps an app account without a refresh token valid', async () => {
    const account = buildAccount({
      provider: ConnectedAccountProvider.APP,
      refreshToken: null,
      lastCredentialsRefreshedAt: refreshedAgo(56 * MINUTE),
      oidcTokenClaims: null,
    });

    await expect(service.isAccessTokenStillValid(account)).resolves.toBe(true);
  });
});
