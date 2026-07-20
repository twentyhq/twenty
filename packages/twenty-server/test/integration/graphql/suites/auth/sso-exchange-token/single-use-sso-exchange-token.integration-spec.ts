import crypto from 'crypto';

import { type DataSource } from 'typeorm';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getAuthTokensFromSsoExchangeToken } from 'test/integration/graphql/utils/get-auth-tokens-from-sso-exchange-token.util';

import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

describe('SSO exchange token redemption (integration)', () => {
  let dataSource: DataSource;

  const seedSsoExchangeToken = async ({
    expiresAt,
  }: {
    expiresAt: Date;
  }): Promise<string> => {
    const plainToken = crypto.randomBytes(32).toString('hex');

    await dataSource.query(
      `INSERT INTO core."appToken" ("userId", "type", "value", "expiresAt", "context")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        USER_DATA_SEED_IDS.JANE,
        AppTokenType.SsoExchangeToken,
        hashToken(plainToken),
        expiresAt,
        JSON.stringify({ authProvider: AuthProviderEnum.Google }),
      ],
    );

    return plainToken;
  };

  const countRemainingRows = async (plainToken: string): Promise<number> => {
    const rows = await dataSource.query(
      `SELECT 1 FROM core."appToken" WHERE "value" = $1 AND "type" = $2`,
      [hashToken(plainToken), AppTokenType.SsoExchangeToken],
    );

    return rows.length;
  };

  beforeAll(() => {
    dataSource = global.testDataSource;
  });

  it('should exchange a valid token for a token pair and consume it', async () => {
    const plainToken = await seedSsoExchangeToken({
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const { data } = await getAuthTokensFromSsoExchangeToken({
      ssoExchangeToken: plainToken,
      expectToFail: false,
    });

    expect(
      data.getAuthTokensFromSsoExchangeToken.tokens
        .accessOrWorkspaceAgnosticToken.token,
    ).toBeDefined();
    expect(
      data.getAuthTokensFromSsoExchangeToken.tokens.refreshToken.token,
    ).toBeDefined();
    expect(await countRemainingRows(plainToken)).toBe(0);
  });

  it('should reject a second redemption of the same token', async () => {
    const plainToken = await seedSsoExchangeToken({
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await getAuthTokensFromSsoExchangeToken({
      ssoExchangeToken: plainToken,
      expectToFail: false,
    });

    const { errors } = await getAuthTokensFromSsoExchangeToken({
      ssoExchangeToken: plainToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should reject an expired token', async () => {
    const plainToken = await seedSsoExchangeToken({
      expiresAt: new Date(Date.now() - 1000),
    });

    const { errors } = await getAuthTokensFromSsoExchangeToken({
      ssoExchangeToken: plainToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
    expect(await countRemainingRows(plainToken)).toBe(0);
  });

  it('should reject an unknown token', async () => {
    const { errors } = await getAuthTokensFromSsoExchangeToken({
      ssoExchangeToken: crypto.randomBytes(32).toString('hex'),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  // The redirect must never yield more than one refresh token, even if the
  // browser and an attacker replaying a leaked URL race each other.
  it('should let exactly one of several concurrent redemptions succeed', async () => {
    const plainToken = await seedSsoExchangeToken({
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        getAuthTokensFromSsoExchangeToken({ ssoExchangeToken: plainToken }),
      ),
    );

    const succeeded = responses.filter(
      (response) => response.data?.getAuthTokensFromSsoExchangeToken,
    );

    expect(succeeded).toHaveLength(1);
    expect(await countRemainingRows(plainToken)).toBe(0);
  });
});
