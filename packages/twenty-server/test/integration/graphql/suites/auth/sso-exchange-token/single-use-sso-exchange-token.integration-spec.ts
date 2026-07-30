import crypto from 'crypto';

import { type DataSource } from 'typeorm';
import { getAuthTokensFromSSOExchangeToken } from 'test/integration/graphql/utils/get-auth-tokens-from-sso-exchange-token.util';

import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

const expectUniformInvalidTokenError = (errors: { message: string }[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0]).toMatchObject({
    message: 'Invalid SSO exchange token',
    extensions: { subCode: AuthExceptionCode.INVALID_INPUT },
  });
};

describe('SSO exchange token redemption (integration)', () => {
  let dataSource: DataSource;

  const seedSSOExchangeToken = async ({
    expiresAt = new Date(Date.now() + 5 * 60 * 1000),
    type = AppTokenType.SSOExchangeToken,
    revokedAt = null,
  }: {
    expiresAt?: Date;
    type?: AppTokenType;
    revokedAt?: Date | null;
  } = {}): Promise<string> => {
    const plainToken = crypto.randomBytes(32).toString('hex');

    await dataSource.query(
      `INSERT INTO core."appToken" ("userId", "type", "value", "expiresAt", "revokedAt", "context")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        USER_DATA_SEED_IDS.JANE,
        type,
        hashToken(plainToken),
        expiresAt,
        revokedAt,
        JSON.stringify({ authProvider: AuthProviderEnum.Google }),
      ],
    );

    return plainToken;
  };

  const countRemainingRows = async (
    plainToken: string,
    type: AppTokenType = AppTokenType.SSOExchangeToken,
  ): Promise<number> => {
    const rows = await dataSource.query(
      `SELECT 1 FROM core."appToken" WHERE "value" = $1 AND "type" = $2`,
      [hashToken(plainToken), type],
    );

    return rows.length;
  };

  beforeAll(() => {
    dataSource = global.testDataSource;
  });

  it('should exchange a valid token for a token pair and consume it', async () => {
    const plainToken = await seedSSOExchangeToken();

    const { data } = await getAuthTokensFromSSOExchangeToken({
      ssoExchangeToken: plainToken,
      expectToFail: false,
    });

    expect(
      data.getAuthTokensFromSSOExchangeToken.tokens
        .accessOrWorkspaceAgnosticToken.token,
    ).toBeDefined();
    expect(
      data.getAuthTokensFromSSOExchangeToken.tokens.refreshToken.token,
    ).toBeDefined();
    expect(await countRemainingRows(plainToken)).toBe(0);
  });

  it('should reject a second redemption of the same token', async () => {
    const plainToken = await seedSSOExchangeToken();

    await getAuthTokensFromSSOExchangeToken({
      ssoExchangeToken: plainToken,
      expectToFail: false,
    });

    const { errors } = await getAuthTokensFromSSOExchangeToken({
      ssoExchangeToken: plainToken,
      expectToFail: true,
    });

    expectUniformInvalidTokenError(errors);
  });

  it('should reject an expired token', async () => {
    const plainToken = await seedSSOExchangeToken({
      expiresAt: new Date(Date.now() - 1000),
    });

    const { errors } = await getAuthTokensFromSSOExchangeToken({
      ssoExchangeToken: plainToken,
      expectToFail: true,
    });

    expectUniformInvalidTokenError(errors);
    expect(await countRemainingRows(plainToken)).toBe(0);
  });

  it('should reject a revoked token without consuming it', async () => {
    const plainToken = await seedSSOExchangeToken({
      revokedAt: new Date(),
    });

    const { errors } = await getAuthTokensFromSSOExchangeToken({
      ssoExchangeToken: plainToken,
      expectToFail: true,
    });

    expectUniformInvalidTokenError(errors);
    expect(await countRemainingRows(plainToken)).toBe(1);
  });

  it('should not redeem an app token of another type sharing the same value', async () => {
    const plainToken = await seedSSOExchangeToken({
      type: AppTokenType.EmailVerificationToken,
    });

    const { errors } = await getAuthTokensFromSSOExchangeToken({
      ssoExchangeToken: plainToken,
      expectToFail: true,
    });

    expectUniformInvalidTokenError(errors);
    expect(
      await countRemainingRows(plainToken, AppTokenType.EmailVerificationToken),
    ).toBe(1);
  });

  it('should reject an unknown token', async () => {
    const { errors } = await getAuthTokensFromSSOExchangeToken({
      ssoExchangeToken: crypto.randomBytes(32).toString('hex'),
      expectToFail: true,
    });

    expectUniformInvalidTokenError(errors);
  });

  it('should let exactly one of several concurrent redemptions succeed', async () => {
    const plainToken = await seedSSOExchangeToken();

    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        getAuthTokensFromSSOExchangeToken({ ssoExchangeToken: plainToken }),
      ),
    );

    const succeeded = responses.filter(
      (response) => response.data?.getAuthTokensFromSSOExchangeToken,
    );

    expect(succeeded).toHaveLength(1);
    expect(await countRemainingRows(plainToken)).toBe(0);
  });
});
