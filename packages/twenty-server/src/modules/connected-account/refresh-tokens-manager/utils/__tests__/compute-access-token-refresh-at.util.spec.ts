import { computeAccessTokenRefreshAt } from 'src/modules/connected-account/refresh-tokens-manager/utils/compute-access-token-refresh-at.util';

const accessTokenIssuedAt = new Date('2026-01-01T12:00:00.000Z');

describe('computeAccessTokenRefreshAt', () => {
  it('refreshes 55 minutes after issue when the provider sent no lifetime, as Google and Microsoft accounts always do', () => {
    expect(
      computeAccessTokenRefreshAt({
        accessTokenIssuedAt,
        accessTokenExpiresAt: null,
      }),
    ).toEqual(new Date('2026-01-01T12:55:00.000Z'));
  });

  it('refreshes a 5-minute token 30 seconds before it expires', () => {
    expect(
      computeAccessTokenRefreshAt({
        accessTokenIssuedAt,
        accessTokenExpiresAt: new Date('2026-01-01T12:05:00.000Z'),
      }),
    ).toEqual(new Date('2026-01-01T12:04:30.000Z'));
  });

  it('caps the refresh margin at 5 minutes for long-lived tokens', () => {
    expect(
      computeAccessTokenRefreshAt({
        accessTokenIssuedAt,
        accessTokenExpiresAt: new Date('2026-01-01T14:00:00.000Z'),
      }),
    ).toEqual(new Date('2026-01-01T13:55:00.000Z'));
  });
});
