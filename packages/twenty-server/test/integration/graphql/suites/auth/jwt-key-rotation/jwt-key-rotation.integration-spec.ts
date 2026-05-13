import { createHash, randomUUID } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import gql from 'graphql-tag';
import * as jwt from 'jsonwebtoken';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isDefined } from 'twenty-shared/utils';

import {
  type AccessTokenJwtPayload,
  type ApplicationAccessTokenJwtPayload,
  type ApplicationRefreshTokenJwtPayload,
  JwtTokenTypeEnum,
  type LoginTokenJwtPayload,
  type RefreshTokenJwtPayload,
  type WorkspaceAgnosticTokenJwtPayload,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import {
  PREVIOUS_KID,
  PREVIOUS_PRIVATE_KEY_PEM,
  PREVIOUS_PUBLIC_KEY_PEM,
  REVOKED_KID,
} from './jwt-key-rotation.fixture';

const HS256_APP_SECRET = 'replace_me_with_a_random_string';

// Mirrors JwtWrapperService.generateAppSecret + extractAppSecretBody so we
// can hand-craft tokens that match what a pre-2.5 server would have signed.
// extractAppSecretBody resolves to workspaceId when present, else userId.
const generateLegacyHs256Secret = (
  type: JwtTokenTypeEnum,
  appSecretBody: string,
): string =>
  createHash('sha256')
    .update(`${HS256_APP_SECRET}${appSecretBody}${type}`)
    .digest('hex');

const forgeLegacyHs256Token = <TPayload extends Record<string, unknown>>(
  payload: TPayload & { type: JwtTokenTypeEnum },
  appSecretBody: string,
  expiresIn: jwt.SignOptions['expiresIn'] = '5m',
): string =>
  jwt.sign(payload, generateLegacyHs256Secret(payload.type, appSecretBody), {
    algorithm: 'HS256',
    expiresIn,
  });

const decodeJwtCompleteOrThrow = (token: string) => {
  const decoded = jwt.decode(token, { complete: true });

  if (!isDefined(decoded)) {
    throw new Error('Failed to decode JWT');
  }

  return decoded;
};

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

const renewTokenMutation = async (appToken: string) => {
  const mutation = gql`
    mutation RenewToken($appToken: String!) {
      renewToken(appToken: $appToken) {
        tokens {
          accessOrWorkspaceAgnosticToken {
            token
          }
          refreshToken {
            token
          }
        }
      }
    }
  `;

  return await makeMetadataAPIRequest(
    { query: mutation, variables: { appToken } },
    undefined,
  );
};

let sharedAccessToken: string;
let sharedRefreshToken: string;
let sharedLoginToken: string;
let sharedWorkspaceAgnosticToken: string;
let sharedAccessPayload: AccessTokenJwtPayload;
let sharedRefreshPayload: RefreshTokenJwtPayload;
let sharedLoginPayload: LoginTokenJwtPayload;
let sharedWorkspaceAgnosticPayload: WorkspaceAgnosticTokenJwtPayload;
let sharedSubdomainUrl: string;
let currentKid: string;

describe('JWT Asymmetric Signing & Key Rotation (integration)', () => {
  beforeAll(async () => {
    const uniqueEmail = `jwt-rotation-${randomUUID()}@example.com`;

    const { data: signUpData } = await signUp({
      input: { email: uniqueEmail, password: 'Test123!@#' },
      expectToFail: false,
    });

    sharedWorkspaceAgnosticToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await global.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [uniqueEmail],
    );

    const { data: workspaceData } = await signUpInNewWorkspace({
      accessToken: sharedWorkspaceAgnosticToken,
      expectToFail: false,
    });

    sharedSubdomainUrl =
      workspaceData.signUpInNewWorkspace.workspace.workspaceUrls.subdomainUrl;

    sharedLoginToken = workspaceData.signUpInNewWorkspace.loginToken.token;

    const { data: tokensData } = await getAuthTokensFromLoginToken({
      loginToken: sharedLoginToken,
      origin: sharedSubdomainUrl,
      expectToFail: false,
    });

    sharedAccessToken =
      tokensData.getAuthTokensFromLoginToken.tokens
        .accessOrWorkspaceAgnosticToken.token;
    sharedRefreshToken =
      tokensData.getAuthTokensFromLoginToken.tokens.refreshToken.token;
    sharedAccessPayload = jwt.decode(
      sharedAccessToken,
    ) as AccessTokenJwtPayload;
    sharedRefreshPayload = jwt.decode(
      sharedRefreshToken,
    ) as RefreshTokenJwtPayload;
    sharedLoginPayload = jwt.decode(sharedLoginToken) as LoginTokenJwtPayload;
    sharedWorkspaceAgnosticPayload = jwt.decode(
      sharedWorkspaceAgnosticToken,
    ) as WorkspaceAgnosticTokenJwtPayload;
    currentKid = decodeJwtCompleteOrThrow(sharedAccessToken).header
      .kid as string;
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

    await global.testDataSource.query(
      `DELETE FROM core."signingKey" WHERE "id" = ANY($1::uuid[])`,
      [[PREVIOUS_KID, REVOKED_KID]],
    );
  });

  it('auto-generates an ES256 signing key on first boot and signs ACCESS tokens with kid + isCurrent row', async () => {
    const decoded = decodeJwtCompleteOrThrow(sharedAccessToken);

    expect(decoded.header.alg).toBe('ES256');
    expect(isNonEmptyString(decoded.header.kid)).toBe(true);

    const rows = await global.testDataSource.query(
      `SELECT "id", "publicKey", "privateKey", "isCurrent", "revokedAt"
       FROM core."signingKey" WHERE "id" = $1`,
      [currentKid],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].isCurrent).toBe(true);
    expect(rows[0].revokedAt).toBeNull();
    expect(isNonEmptyString(rows[0].publicKey)).toBe(true);
    expect(isNonEmptyString(rows[0].privateKey)).toBe(true);
    expect(rows[0].publicKey).toMatch(
      /^-----BEGIN PUBLIC KEY-----[\s\S]+-----END PUBLIC KEY-----\s*$/,
    );

    const { data, errors } = await getCurrentUser({
      accessToken: sharedAccessToken,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.currentUser).toBeDefined();
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

  it('verifies a token signed by a previously rotated-out kid (privateKey null, public key still present)', async () => {
    await global.testDataSource.query(
      `INSERT INTO core."signingKey" ("id", "publicKey", "privateKey", "isCurrent")
       VALUES ($1, $2, NULL, false)
       ON CONFLICT ("id") DO NOTHING`,
      [PREVIOUS_KID, PREVIOUS_PUBLIC_KEY_PEM],
    );

    const tokenSignedByPreviousKey = jwt.sign(
      buildAccessTokenPayload(sharedAccessPayload),
      PREVIOUS_PRIVATE_KEY_PEM,
      { algorithm: 'ES256', keyid: PREVIOUS_KID, expiresIn: '5m' },
    );

    const decoded = decodeJwtCompleteOrThrow(tokenSignedByPreviousKey);

    expect(decoded.header.alg).toBe('ES256');
    expect(decoded.header.kid).toBe(PREVIOUS_KID);
    expect(decoded.header.kid).not.toBe(currentKid);

    const { data, errors } = await getCurrentUser({
      accessToken: tokenSignedByPreviousKey,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.currentUser?.id).toBe(sharedAccessPayload.userId);
  });

  it('rejects a token signed by a revoked kid (publicKey present, revokedAt set)', async () => {
    await global.testDataSource.query(
      `INSERT INTO core."signingKey" ("id", "publicKey", "privateKey", "isCurrent", "revokedAt")
       VALUES ($1, $2, NULL, false, NOW())
       ON CONFLICT ("id") DO UPDATE SET "revokedAt" = NOW(), "isCurrent" = false`,
      [REVOKED_KID, PREVIOUS_PUBLIC_KEY_PEM],
    );

    const tokenSignedByRevokedKey = jwt.sign(
      buildAccessTokenPayload(sharedAccessPayload),
      PREVIOUS_PRIVATE_KEY_PEM,
      { algorithm: 'ES256', keyid: REVOKED_KID, expiresIn: '5m' },
    );

    const { data, errors } = await getCurrentUser({
      accessToken: tokenSignedByRevokedKey,
      expectToFail: true,
    });

    expect(data?.currentUser).toBeFalsy();

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('rejects a token whose kid was never registered without leaking a 500', async () => {
    const unknownKid = '00000000-0000-4000-8000-000000000099';

    const tokenSignedByOrphanKey = jwt.sign(
      buildAccessTokenPayload(sharedAccessPayload),
      PREVIOUS_PRIVATE_KEY_PEM,
      { algorithm: 'ES256', keyid: unknownKid, expiresIn: '5m' },
    );

    const { data, errors } = await getCurrentUser({
      accessToken: tokenSignedByOrphanKey,
      expectToFail: true,
    });

    expect(data?.currentUser).toBeFalsy();

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it.each([
    ['REFRESH', () => sharedRefreshToken],
    ['WORKSPACE_AGNOSTIC', () => sharedWorkspaceAgnosticToken],
    ['LOGIN', () => sharedLoginToken],
  ])(
    'signs %s tokens with ES256 + kid pointing at the current signing key',
    (_label, getToken) => {
      const decoded = decodeJwtCompleteOrThrow(getToken());

      expect(decoded.header.alg).toBe('ES256');
      expect(decoded.header.kid).toBe(currentKid);
    },
  );

  it('round-trips a new ES256 REFRESH token through renewToken', async () => {
    const response = await renewTokenMutation(sharedRefreshToken);

    expect(response.body.errors).toBeUndefined();
    expect(
      isNonEmptyString(
        response.body.data?.renewToken.tokens.accessOrWorkspaceAgnosticToken
          .token,
      ),
    ).toBe(true);
    expect(
      isNonEmptyString(
        response.body.data?.renewToken.tokens.refreshToken.token,
      ),
    ).toBe(true);
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

    // jti is a registered JWT claim and must be provided via the `jwtid`
    // sign option, not on the payload object (jsonwebtoken throws otherwise).
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

    const forgedToken = jwt.sign(
      forgedRefreshPayload,
      generateLegacyHs256Secret(
        JwtTokenTypeEnum.REFRESH,
        sharedRefreshPayload.workspaceId ?? sharedRefreshPayload.userId,
      ),
      {
        algorithm: 'HS256',
        expiresIn: '5m',
        jwtid: sharedRefreshPayload.jti,
      },
    );

    const decoded = decodeJwtCompleteOrThrow(forgedToken);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const response = await renewTokenMutation(forgedToken);

    expect(response.body.errors).toBeUndefined();
    expect(
      isNonEmptyString(
        response.body.data?.renewToken.tokens.accessOrWorkspaceAgnosticToken
          .token,
      ),
    ).toBe(true);
  });
});

const generateApiKeyTokenMutation = async (
  apiKeyId: string,
  accessToken: string,
) => {
  const mutation = gql`
    mutation GenerateApiKeyToken($apiKeyId: UUID!, $expiresAt: String!) {
      generateApiKeyToken(apiKeyId: $apiKeyId, expiresAt: $expiresAt) {
        token
      }
    }
  `;

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  return await makeMetadataAPIRequest(
    { query: mutation, variables: { apiKeyId, expiresAt } },
    accessToken,
  );
};

const findManyApplicationsWithApiKey = async (apiKeyToken: string) => {
  const query = gql`
    query FindManyApplications {
      findManyApplications {
        id
      }
    }
  `;

  return await makeMetadataAPIRequest({ query, variables: {} }, apiKeyToken);
};

const renewApplicationTokenMutation = async (
  applicationRefreshToken: string,
  accessToken: string,
) => {
  const mutation = gql`
    mutation RenewApplicationToken($applicationRefreshToken: String!) {
      renewApplicationToken(applicationRefreshToken: $applicationRefreshToken) {
        applicationAccessToken {
          token
        }
        applicationRefreshToken {
          token
        }
      }
    }
  `;

  return await makeMetadataAPIRequest(
    { query: mutation, variables: { applicationRefreshToken } },
    accessToken,
  );
};

describe('JWT Asymmetric Signing for seeded-workspace tokens (integration)', () => {
  const seededApiKeyId = API_KEY_DATA_SEED_IDS.ID_1;
  const seededWorkspaceId = SEED_APPLE_WORKSPACE_ID;
  let seededCurrentKid: string;
  let seededApplicationId: string;

  beforeAll(async () => {
    const [{ id: currentKidRow }] = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );

    seededCurrentKid = currentKidRow;

    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });

    const firstApplication = applicationsData.findManyApplications[0];

    expect(firstApplication).toBeDefined();

    seededApplicationId = firstApplication.id;
  });

  it('signs new API_KEY tokens with ES256 + kid and authenticates against the GraphQL API', async () => {
    const response = await generateApiKeyTokenMutation(
      seededApiKeyId,
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const apiKeyToken: string =
      response.body.data?.generateApiKeyToken.token ?? '';

    expect(isNonEmptyString(apiKeyToken)).toBe(true);

    const decoded = decodeJwtCompleteOrThrow(apiKeyToken);

    expect(decoded.header.alg).toBe('ES256');
    expect(decoded.header.kid).toBe(seededCurrentKid);

    const apiResponse = await findManyApplicationsWithApiKey(apiKeyToken);

    expect(apiResponse.body.errors).toBeUndefined();
    expect(apiResponse.body.data?.findManyApplications).toBeDefined();
  });

  it('verifies the seeded legacy HS256 no-kid API_KEY token via the legacy fallback', async () => {
    const decoded = decodeJwtCompleteOrThrow(API_KEY_ACCESS_TOKEN);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const apiResponse =
      await findManyApplicationsWithApiKey(API_KEY_ACCESS_TOKEN);

    expect(apiResponse.body.errors).toBeUndefined();
    expect(apiResponse.body.data?.findManyApplications).toBeDefined();
  });

  it('verifies a hand-crafted no-kid HS256 API_KEY token via the legacy fallback', async () => {
    const forgedPayload = {
      sub: seededWorkspaceId,
      type: JwtTokenTypeEnum.API_KEY,
      workspaceId: seededWorkspaceId,
    };

    const forgedToken = jwt.sign(
      forgedPayload,
      generateLegacyHs256Secret(JwtTokenTypeEnum.API_KEY, seededWorkspaceId),
      { algorithm: 'HS256', expiresIn: '5m', jwtid: seededApiKeyId },
    );

    const decoded = decodeJwtCompleteOrThrow(forgedToken);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const apiResponse = await findManyApplicationsWithApiKey(forgedToken);

    expect(apiResponse.body.errors).toBeUndefined();
    expect(apiResponse.body.data?.findManyApplications).toBeDefined();
  });

  it('signs new APPLICATION_ACCESS + APPLICATION_REFRESH tokens with ES256 + kid via generateApplicationToken', async () => {
    const { data, errors } = await generateApplicationToken({
      applicationId: seededApplicationId,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const { applicationAccessToken, applicationRefreshToken } =
      data.generateApplicationToken;

    const decodedAccess = decodeJwtCompleteOrThrow(
      applicationAccessToken.token,
    );
    const decodedRefresh = decodeJwtCompleteOrThrow(
      applicationRefreshToken.token,
    );

    expect(decodedAccess.header.alg).toBe('ES256');
    expect(decodedAccess.header.kid).toBe(seededCurrentKid);
    expect(decodedRefresh.header.alg).toBe('ES256');
    expect(decodedRefresh.header.kid).toBe(seededCurrentKid);

    const accessPayload = jwt.decode(
      applicationAccessToken.token,
    ) as ApplicationAccessTokenJwtPayload;

    expect(accessPayload.type).toBe(JwtTokenTypeEnum.APPLICATION_ACCESS);
    expect(accessPayload.workspaceId).toBe(seededWorkspaceId);
    expect(accessPayload.applicationId).toBe(seededApplicationId);
  });

  it('round-trips a new ES256 APPLICATION_REFRESH token through renewApplicationToken', async () => {
    const { data } = await generateApplicationToken({
      applicationId: seededApplicationId,
      expectToFail: false,
    });

    const response = await renewApplicationTokenMutation(
      data.generateApplicationToken.applicationRefreshToken.token,
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const renewed = response.body.data?.renewApplicationToken;

    expect(isNonEmptyString(renewed?.applicationAccessToken.token)).toBe(true);
    expect(isNonEmptyString(renewed?.applicationRefreshToken.token)).toBe(true);

    expect(
      decodeJwtCompleteOrThrow(renewed.applicationAccessToken.token).header.alg,
    ).toBe('ES256');
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

    const response = await renewApplicationTokenMutation(
      forgedToken,
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const renewed = response.body.data?.renewApplicationToken;

    expect(isNonEmptyString(renewed?.applicationAccessToken.token)).toBe(true);
    expect(isNonEmptyString(renewed?.applicationRefreshToken.token)).toBe(true);
  });
});
