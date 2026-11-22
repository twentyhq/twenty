import { randomUUID } from 'crypto';

import * as jwt from 'jsonwebtoken';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { forgeLegacyHs256Token } from 'test/integration/graphql/utils/forge-legacy-hs256-token.util';
import { renewToken } from 'test/integration/graphql/utils/renew-token.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type RefreshTokenJwtPayload } from 'src/engine/core-modules/auth/types/refresh-token-jwt-payload.type';

describe('renewToken with a refresh token not bound to a workspace (integration)', () => {
  let workspaceAgnosticToken: string;
  let refreshPayload: RefreshTokenJwtPayload;

  beforeAll(async () => {
    const { data } = await signUp({
      input: {
        email: `renew-without-workspace-${randomUUID()}@example.com`,
        password: 'Test123!@#',
      },
      expectToFail: false,
    });

    workspaceAgnosticToken =
      data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;
    refreshPayload = jwt.decode(
      data.signUp.tokens.refreshToken.token,
    ) as RefreshTokenJwtPayload;
  });

  afterAll(async () => {
    await deleteUser({
      accessToken: workspaceAgnosticToken,
      expectToFail: false,
    });
  });

  it('should refuse a legacy refresh token without a workspace before revoking it', async () => {
    const legacyRefreshToken = forgeLegacyHs256Token(
      {
        sub: refreshPayload.sub,
        userId: refreshPayload.userId,
        type: JwtTokenTypeEnum.REFRESH,
      },
      refreshPayload.userId,
      { expiresIn: '5m', jwtid: refreshPayload.jti },
    );

    const response = await renewToken(legacyRefreshToken);

    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });

    const [appToken] = await global.testDataSource.query(
      'SELECT "revokedAt" FROM core."appToken" WHERE id = $1',
      [refreshPayload.jti],
    );

    expect(appToken.revokedAt).toBeNull();
  });
});
