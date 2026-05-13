import { randomUUID } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import * as jwt from 'jsonwebtoken';
import { decodeJwtCompleteOrThrow } from 'test/integration/graphql/utils/decode-jwt-complete-or-throw.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { forgeLegacyHs256Token } from 'test/integration/graphql/utils/forge-legacy-hs256-token.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { renewApplicationToken } from 'test/integration/graphql/utils/renew-application-token.util';
import { renewToken } from 'test/integration/graphql/utils/renew-token.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';

import {
  type AccessTokenJwtPayload,
  type ApplicationRefreshTokenJwtPayload,
  JwtTokenTypeEnum,
  type LoginTokenJwtPayload,
  type RefreshTokenJwtPayload,
  type WorkspaceAgnosticTokenJwtPayload,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const buildAccessTokenPayload = (payload: AccessTokenJwtPayload) => ({
  sub: payload.sub,
  userId: payload.userId,
  workspaceId: payload.workspaceId,
  workspaceMemberId: payload.workspaceMemberId,
  userWorkspaceId: payload.userWorkspaceId,
  authProvider: payload.authProvider,
  isImpersonating: false,
  type: JwtTokenTypeEnum.ACCESS,
});

describe('JWT Legacy HS256 no-kid fallback (integration)', () => {
  let sharedAccessToken: string;
  let sharedAccessPayload: AccessTokenJwtPayload;
  let sharedRefreshPayload: RefreshTokenJwtPayload;
  let sharedLoginPayload: LoginTokenJwtPayload;
  let sharedWorkspaceAgnosticPayload: WorkspaceAgnosticTokenJwtPayload;
  let sharedSubdomainUrl: string;

  beforeAll(async () => {
    const uniqueEmail = `jwt-legacy-${randomUUID()}@example.com`;

    const { data: signUpData } = await signUp({
      input: { email: uniqueEmail, password: 'Test123!@#' },
      expectToFail: false,
    });

    const workspaceAgnosticToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    sharedWorkspaceAgnosticPayload = jwt.decode(
      workspaceAgnosticToken,
    ) as WorkspaceAgnosticTokenJwtPayload;

    await global.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [uniqueEmail],
    );

    const { data: workspaceData } = await signUpInNewWorkspace({
      accessToken: workspaceAgnosticToken,
      expectToFail: false,
    });

    sharedSubdomainUrl =
      workspaceData.signUpInNewWorkspace.workspace.workspaceUrls.subdomainUrl;

    const loginToken = workspaceData.signUpInNewWorkspace.loginToken.token;

    sharedLoginPayload = jwt.decode(loginToken) as LoginTokenJwtPayload;

    const { data: tokensData } = await getAuthTokensFromLoginToken({
      loginToken,
      origin: sharedSubdomainUrl,
      expectToFail: false,
    });

    sharedAccessToken =
      tokensData.getAuthTokensFromLoginToken.tokens
        .accessOrWorkspaceAgnosticToken.token;
    sharedAccessPayload = jwt.decode(
      sharedAccessToken,
    ) as AccessTokenJwtPayload;
    sharedRefreshPayload = jwt.decode(
      tokensData.getAuthTokensFromLoginToken.tokens.refreshToken.token,
    ) as RefreshTokenJwtPayload;
  });

  afterAll(async () => {
    if (isNonEmptyString(sharedAccessToken)) {
      try {
        await deleteUser({
          accessToken: sharedAccessToken,
          expectToFail: false,
        });
      } catch {
        /* */
      }
    }
  });

  it('verifies a hand-crafted no-kid HS256 ACCESS token via the legacy fallback', async () => {
    const legacyHs256Token = forgeLegacyHs256Token(
      buildAccessTokenPayload(sharedAccessPayload),
      sharedAccessPayload.workspaceId,
    );

    const decoded = decodeJwtCompleteOrThrow(legacyHs256Token);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const { data, errors } = await getCurrentUser({
      accessToken: legacyHs256Token,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.currentUser?.id).toBe(sharedAccessPayload.userId);
  });

  it('verifies a hand-crafted no-kid HS256 LOGIN token via the legacy fallback (round-trip through getAuthTokensFromLoginToken)', async () => {
    const forgedLoginPayload: LoginTokenJwtPayload = {
      sub: sharedLoginPayload.sub,
      type: JwtTokenTypeEnum.LOGIN,
      workspaceId: sharedLoginPayload.workspaceId,
      authProvider:
        sharedLoginPayload.authProvider ?? AuthProviderEnum.Password,
    };

    const forgedToken = forgeLegacyHs256Token(
      forgedLoginPayload,
      sharedLoginPayload.workspaceId,
    );

    const decoded = decodeJwtCompleteOrThrow(forgedToken);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const { data, errors } = await getAuthTokensFromLoginToken({
      loginToken: forgedToken,
      origin: sharedSubdomainUrl,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(
      isNonEmptyString(
        data?.getAuthTokensFromLoginToken.tokens.accessOrWorkspaceAgnosticToken
          .token,
      ),
    ).toBe(true);
  });

  it('verifies a hand-crafted no-kid HS256 WORKSPACE_AGNOSTIC token via the legacy fallback (round-trip through signUpInNewWorkspace)', async () => {
    const forgedAgnosticPayload: WorkspaceAgnosticTokenJwtPayload = {
      sub: sharedWorkspaceAgnosticPayload.sub,
      userId: sharedWorkspaceAgnosticPayload.userId,
      type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
      authProvider:
        sharedWorkspaceAgnosticPayload.authProvider ??
        AuthProviderEnum.Password,
    };

    const forgedToken = forgeLegacyHs256Token(
      forgedAgnosticPayload,
      sharedWorkspaceAgnosticPayload.userId,
    );

    const decoded = decodeJwtCompleteOrThrow(forgedToken);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const { data, errors } = await signUpInNewWorkspace({
      accessToken: forgedToken,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(isNonEmptyString(data?.signUpInNewWorkspace.workspace.id)).toBe(
      true,
    );
  });

  it('verifies a hand-crafted no-kid HS256 REFRESH token via the legacy fallback (round-trip through renewToken)', async () => {
    expect(isNonEmptyString(sharedRefreshPayload.jti)).toBe(true);

    const forgedRefreshPayload = {
      sub: sharedRefreshPayload.sub,
      type: JwtTokenTypeEnum.REFRESH,
      userId: sharedRefreshPayload.userId,
      workspaceId: sharedRefreshPayload.workspaceId,
      authProvider:
        sharedRefreshPayload.authProvider ?? AuthProviderEnum.Password,
      targetedTokenType:
        sharedRefreshPayload.targetedTokenType ?? JwtTokenTypeEnum.ACCESS,
    };

    const forgedToken = forgeLegacyHs256Token(
      forgedRefreshPayload,
      sharedRefreshPayload.workspaceId ?? sharedRefreshPayload.userId,
      { expiresIn: '5m', jwtid: sharedRefreshPayload.jti },
    );

    const decoded = decodeJwtCompleteOrThrow(forgedToken);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const response = await renewToken(forgedToken);

    expect(response.body.errors).toBeUndefined();
    expect(
      isNonEmptyString(
        response.body.data?.renewToken.tokens.accessOrWorkspaceAgnosticToken
          .token,
      ),
    ).toBe(true);
  });
});

describe('JWT Legacy HS256 no-kid fallback - seeded-workspace tokens (integration)', () => {
  const seededApiKeyId = API_KEY_DATA_SEED_IDS.ID_1;
  const seededWorkspaceId = SEED_APPLE_WORKSPACE_ID;
  let seededApplicationId: string;

  beforeAll(async () => {
    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });

    const firstApplication = applicationsData.findManyApplications[0];

    expect(firstApplication).toBeDefined();

    seededApplicationId = firstApplication.id;
  });

  it('verifies the seeded legacy HS256 no-kid API_KEY token via the legacy fallback', async () => {
    const decoded = decodeJwtCompleteOrThrow(API_KEY_ACCESS_TOKEN);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const { data, errors } = await findManyApplications({
      accessToken: API_KEY_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.findManyApplications).toBeDefined();
  });

  it('verifies a hand-crafted no-kid HS256 API_KEY token via the legacy fallback', async () => {
    const forgedPayload = {
      sub: seededWorkspaceId,
      type: JwtTokenTypeEnum.API_KEY,
      workspaceId: seededWorkspaceId,
    };

    const forgedToken = forgeLegacyHs256Token(
      forgedPayload,
      seededWorkspaceId,
      {
        expiresIn: '5m',
        jwtid: seededApiKeyId,
      },
    );

    const decoded = decodeJwtCompleteOrThrow(forgedToken);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const { data, errors } = await findManyApplications({
      accessToken: forgedToken,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.findManyApplications).toBeDefined();
  });

  it('verifies a hand-crafted no-kid HS256 APPLICATION_REFRESH token via the legacy fallback (round-trip through renewApplicationToken)', async () => {
    const forgedPayload: ApplicationRefreshTokenJwtPayload = {
      sub: seededApplicationId,
      type: JwtTokenTypeEnum.APPLICATION_REFRESH,
      workspaceId: seededWorkspaceId,
      applicationId: seededApplicationId,
    };

    const forgedToken = forgeLegacyHs256Token(
      forgedPayload as unknown as Record<string, unknown> & {
        type: JwtTokenTypeEnum;
      },
      seededWorkspaceId,
    );

    const decoded = decodeJwtCompleteOrThrow(forgedToken);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const response = await renewApplicationToken({
      applicationRefreshToken: forgedToken,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();

    const renewed = response.body.data?.renewApplicationToken;

    expect(isNonEmptyString(renewed?.applicationAccessToken.token)).toBe(true);
    expect(isNonEmptyString(renewed?.applicationRefreshToken.token)).toBe(true);
  });
});
