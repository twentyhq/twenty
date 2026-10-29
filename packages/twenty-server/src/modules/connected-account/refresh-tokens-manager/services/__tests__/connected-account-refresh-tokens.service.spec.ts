import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

describe('ConnectedAccountRefreshTokensService - isAccessTokenStillValid', () => {
  let service: ConnectedAccountRefreshTokensService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

    service = new ConnectedAccountRefreshTokensService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const buildAccount = (
    overrides: Partial<ConnectedAccountEntity> = {},
  ): ConnectedAccountEntity =>
    ({
      id: 'account-id',
      provider: ConnectedAccountProvider.APP,
      refreshToken: 'enc:v2:refresh-token' as EncryptedString,
      lastCredentialsRefreshedAt: new Date('2026-01-01T12:00:00.000Z'),
      accessTokenExpiresAt: null,
      ...overrides,
    }) as ConnectedAccountEntity;

  it('respects short-lived accessTokenExpiresAt (e.g. 300s)', async () => {
    const account = buildAccount({
      lastCredentialsRefreshedAt: new Date('2026-01-01T12:00:00.000Z'),
      accessTokenExpiresAt: new Date('2026-01-01T12:05:00.000Z'), // 5 minutes
    });

    // 3 seconds after issue -> still valid
    jest.setSystemTime(new Date('2026-01-01T12:00:03.000Z'));
    expect(await service.isAccessTokenStillValid(account)).toBe(true);

    // 4 minutes after issue -> still valid
    jest.setSystemTime(new Date('2026-01-01T12:04:00.000Z'));
    expect(await service.isAccessTokenStillValid(account)).toBe(true);

    // 4 minutes 35 seconds (within 30s buffer before expiry) -> should refresh
    jest.setSystemTime(new Date('2026-01-01T12:04:35.000Z'));
    expect(await service.isAccessTokenStillValid(account)).toBe(false);

    // 6 minutes after issue (past expiry) -> should refresh
    jest.setSystemTime(new Date('2026-01-01T12:06:00.000Z'));
    expect(await service.isAccessTokenStillValid(account)).toBe(false);
  });

  it('falls back to 1-hour expiration when accessTokenExpiresAt is null', async () => {
    const account = buildAccount({
      lastCredentialsRefreshedAt: new Date('2026-01-01T12:00:00.000Z'),
      accessTokenExpiresAt: null,
    });

    // 30 minutes after issue -> still valid under 1-hour fallback
    jest.setSystemTime(new Date('2026-01-01T12:30:00.000Z'));
    expect(await service.isAccessTokenStillValid(account)).toBe(true);

    // 56 minutes after issue (within 5-minute buffer of 60m) -> should refresh
    jest.setSystemTime(new Date('2026-01-01T12:56:00.000Z'));
    expect(await service.isAccessTokenStillValid(account)).toBe(false);
  });

  it('returns true for APP provider when refreshToken is absent', async () => {
    const account = buildAccount({
      refreshToken: null,
      lastCredentialsRefreshedAt: new Date('2026-01-01T11:00:00.000Z'),
    });

    expect(await service.isAccessTokenStillValid(account)).toBe(true);
  });
});
