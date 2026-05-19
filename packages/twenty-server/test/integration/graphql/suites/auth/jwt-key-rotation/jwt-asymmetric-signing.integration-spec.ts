import { randomUUID } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import * as jwt from 'jsonwebtoken';
import { decodeJwtCompleteOrThrow } from 'test/integration/graphql/utils/decode-jwt-complete-or-throw.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { renewApplicationToken } from 'test/integration/graphql/utils/renew-application-token.util';
import { renewToken } from 'test/integration/graphql/utils/renew-token.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';

import {
  type AccessTokenJwtPayload,
  type ApplicationAccessTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import {
  PREVIOUS_KID,
  PREVIOUS_PRIVATE_KEY_PEM,
  PREVIOUS_PUBLIC_KEY_PEM,
  REVOKED_KID,
} from './jwt-key-rotation.fixture';

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

describe('JWT Asymmetric Signing - new ES256 + kid implementation (integration)', () => {
  let sharedAccessToken: string;
  let sharedRefreshToken: string;
  let sharedAccessPayload: AccessTokenJwtPayload;
  let currentKid: string;

  beforeAll(async () => {
    const uniqueEmail = `jwt-asymmetric-${randomUUID()}@example.com`;

    const { data: signUpData } = await signUp({
      input: { email: uniqueEmail, password: 'Test123!@#' },
      expectToFail: false,
    });

    const workspaceAgnosticToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await global.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [uniqueEmail],
    );

    const { data: workspaceData } = await signUpInNewWorkspace({
      accessToken: workspaceAgnosticToken,
      expectToFail: false,
    });

    const subdomainUrl =
      workspaceData.signUpInNewWorkspace.workspace.workspaceUrls.subdomainUrl;

    const loginToken = workspaceData.signUpInNewWorkspace.loginToken.token;

    const { data: tokensData } = await getAuthTokensFromLoginToken({
      loginToken,
      origin: subdomainUrl,
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

  it('round-trips a new ES256 REFRESH token through renewToken', async () => {
    const response = await renewToken(sharedRefreshToken);

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
});

describe('JWT Asymmetric Signing - seeded-workspace tokens (integration)', () => {
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
    const response = await generateApiKeyToken({
      apiKeyId: seededApiKeyId,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();

    const apiKeyToken: string =
      response.body.data?.generateApiKeyToken.token ?? '';

    expect(isNonEmptyString(apiKeyToken)).toBe(true);

    const decoded = decodeJwtCompleteOrThrow(apiKeyToken);

    expect(decoded.header.alg).toBe('ES256');
    expect(decoded.header.kid).toBe(seededCurrentKid);

    const { data, errors } = await findManyApplications({
      accessToken: apiKeyToken,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.findManyApplications).toBeDefined();
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

    const response = await renewApplicationToken({
      applicationRefreshToken:
        data.generateApplicationToken.applicationRefreshToken.token,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();

    const renewed = response.body.data?.renewApplicationToken;

    expect(isNonEmptyString(renewed?.applicationAccessToken.token)).toBe(true);
    expect(isNonEmptyString(renewed?.applicationRefreshToken.token)).toBe(true);

    expect(
      decodeJwtCompleteOrThrow(renewed.applicationAccessToken.token).header.alg,
    ).toBe('ES256');
  });
});
