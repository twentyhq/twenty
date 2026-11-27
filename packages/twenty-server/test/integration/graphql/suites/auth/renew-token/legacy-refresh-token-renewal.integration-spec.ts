import { createHash, randomBytes, randomUUID } from 'crypto';

import gql from 'graphql-tag';
import * as jwt from 'jsonwebtoken';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { forgeLegacyHs256Token } from 'test/integration/graphql/utils/forge-legacy-hs256-token.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { renewToken } from 'test/integration/graphql/utils/renew-token.util';
import { seedLegacyRefreshToken } from 'test/integration/graphql/utils/seed-legacy-refresh-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { type AccessTokenJwtPayload } from 'src/engine/core-modules/auth/types/access-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const findAppToken = (id: string) =>
  getCoreRepository<AppTokenEntity>(AppTokenEntity).findOneByOrFail({ id });

const countRefreshTokens = (userId: string) =>
  getCoreRepository<AppTokenEntity>(AppTokenEntity).countBy({
    userId,
    type: AppTokenType.RefreshToken,
  });

const expectRejected = (response: Awaited<ReturnType<typeof renewToken>>) => {
  expect(response.body.data).toBeNull();
  expect(response.body.errors).toHaveLength(1);
  expect(response.body.errors[0].extensions.code).not.toBe(
    'INTERNAL_SERVER_ERROR',
  );
};

describe('renewToken with a refresh token issued before minting stopped (integration)', () => {
  let accessToken: string;
  let userId: string;
  let workspaceId: string;

  beforeAll(async () => {
    const email = `legacy-refresh-renewal-${randomUUID()}@example.com`;

    const { data: signUpData } = await signUp({
      input: { email, password: 'Test123!@#' },
      expectToFail: false,
    });

    await global.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [email],
    );

    const { data: workspaceData } = await signUpInNewWorkspace({
      accessToken:
        signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token,
      expectToFail: false,
    });

    const { data: tokensData } = await getAuthTokensFromLoginToken({
      loginToken: workspaceData.signUpInNewWorkspace.loginToken.token,
      origin:
        workspaceData.signUpInNewWorkspace.workspace.workspaceUrls.subdomainUrl,
      expectToFail: false,
    });

    accessToken =
      tokensData.getAuthTokensFromLoginToken.tokens
        .accessOrWorkspaceAgnosticToken.token;

    const accessPayload = jwt.decode(accessToken) as AccessTokenJwtPayload;

    userId = accessPayload.userId;
    workspaceId = accessPayload.workspaceId;
  });

  afterAll(async () => {
    try {
      await deleteUser({ accessToken, expectToFail: false });
    } catch {
      /* */
    }
  });

  it('should return an access token and no refresh token, and keep the presented token usable', async () => {
    const { refreshToken, appTokenId } = await seedLegacyRefreshToken({
      userId,
      workspaceId,
    });
    const refreshTokenCount = await countRefreshTokens(userId);

    for (let call = 0; call < 2; call++) {
      const response = await renewToken(refreshToken);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.renewToken.tokens.refreshToken).toBeNull();

      const renewedAccessToken =
        response.body.data.renewToken.tokens.accessOrWorkspaceAgnosticToken
          .token;
      const renewedPayload = jwt.decode(
        renewedAccessToken,
      ) as AccessTokenJwtPayload;

      expect(renewedPayload.type).toBe(JwtTokenTypeEnum.ACCESS);
      expect(renewedPayload.userId).toBe(userId);
      expect(renewedPayload.workspaceId).toBe(workspaceId);

      const { errors } = await getCurrentUser({
        accessToken: renewedAccessToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
    }

    expect(await countRefreshTokens(userId)).toBe(refreshTokenCount);
    expect((await findAppToken(appTokenId)).revokedAt).toBeNull();
  });

  it('should return a workspace-agnostic token for a token not bound to a workspace', async () => {
    const { refreshToken } = await seedLegacyRefreshToken({ userId });

    const response = await renewToken(refreshToken);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.renewToken.tokens.refreshToken).toBeNull();
    expect(
      jwt.decode(
        response.body.data.renewToken.tokens.accessOrWorkspaceAgnosticToken
          .token,
      ),
    ).toMatchObject({ type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC, userId });
  });

  it.each([
    ['revoked', { revokedAt: new Date() }],
    ['expired', { expiresAt: new Date(Date.now() - ONE_DAY_MS) }],
    ['deleted', { deletedAt: new Date() }],
  ])('should reject a refresh token that is %s', async (_label, overrides) => {
    const { refreshToken } = await seedLegacyRefreshToken({
      userId,
      workspaceId,
      ...overrides,
    });

    expectRejected(await renewToken(refreshToken));
  });

  it('should refuse a legacy refresh token without a workspace before revoking it', async () => {
    const { appTokenId } = await seedLegacyRefreshToken({ userId });

    const legacyRefreshToken = forgeLegacyHs256Token(
      { sub: userId, userId, type: JwtTokenTypeEnum.REFRESH },
      userId,
      { expiresIn: '5m', jwtid: appTokenId },
    );

    expectRejected(await renewToken(legacyRefreshToken));
    expect((await findAppToken(appTokenId)).revokedAt).toBeNull();
  });

  it('should revoke outstanding refresh tokens when the password changes', async () => {
    const { refreshToken, appTokenId } = await seedLegacyRefreshToken({
      userId,
      workspaceId,
    });

    const passwordResetToken = randomBytes(32).toString('hex');
    const appTokenRepository =
      getCoreRepository<AppTokenEntity>(AppTokenEntity);

    await appTokenRepository.save(
      appTokenRepository.create({
        userId,
        workspaceId,
        type: AppTokenType.PasswordResetToken,
        value: createHash('sha256').update(passwordResetToken).digest('hex'),
        expiresAt: new Date(Date.now() + ONE_DAY_MS),
      }),
    );

    const updatePasswordResponse = await makeMetadataApiRequest(
      {
        query: gql`
          mutation UpdatePasswordViaResetToken(
            $passwordResetToken: String!
            $newPassword: String!
          ) {
            updatePasswordViaResetToken(
              passwordResetToken: $passwordResetToken
              newPassword: $newPassword
            ) {
              success
            }
          }
        `,
        variables: { passwordResetToken, newPassword: 'NewTest123!@#' },
      },
      undefined,
    );

    expect(updatePasswordResponse.body.errors).toBeUndefined();
    expect((await findAppToken(appTokenId)).revokedAt).not.toBeNull();

    const response = await renewToken(refreshToken);

    expect(response.body.data).toBeNull();
    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  });
});
