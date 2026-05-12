import { createHash, randomUUID } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import * as jwt from 'jsonwebtoken';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { isDefined } from 'twenty-shared/utils';

import {
  type AccessTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';

import {
  PREVIOUS_KID,
  PREVIOUS_PRIVATE_KEY_PEM,
  PREVIOUS_PUBLIC_KEY_PEM,
  REVOKED_KID,
} from './jwt-key-rotation.fixture';

const HS256_APP_SECRET = 'replace_me_with_a_random_string';

const generateLegacyHs256Secret = (
  type: JwtTokenTypeEnum,
  appSecretBody: string,
): string =>
  createHash('sha256')
    .update(`${HS256_APP_SECRET}${appSecretBody}${type}`)
    .digest('hex');

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

let sharedAccessToken: string;
let sharedPayload: AccessTokenJwtPayload;
let currentKid: string;

describe('JWT Asymmetric Signing & Key Rotation (integration)', () => {
  beforeAll(async () => {
    const uniqueEmail = `jwt-rotation-${randomUUID()}@example.com`;

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
    sharedPayload = jwt.decode(sharedAccessToken) as AccessTokenJwtPayload;
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
    const legacyHs256Token = jwt.sign(
      buildAccessTokenPayload(sharedPayload),
      generateLegacyHs256Secret(
        JwtTokenTypeEnum.ACCESS,
        sharedPayload.workspaceId,
      ),
      { algorithm: 'HS256', expiresIn: '5m' },
    );

    const decoded = decodeJwtCompleteOrThrow(legacyHs256Token);

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.kid).toBeUndefined();

    const { data, errors } = await getCurrentUser({
      accessToken: legacyHs256Token,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.currentUser?.id).toBe(sharedPayload.userId);
  });

  it('verifies a token signed by a previously rotated-out kid (privateKey null, public key still present)', async () => {
    await global.testDataSource.query(
      `INSERT INTO core."signingKey" ("id", "publicKey", "privateKey", "isCurrent")
       VALUES ($1, $2, NULL, false)
       ON CONFLICT ("id") DO NOTHING`,
      [PREVIOUS_KID, PREVIOUS_PUBLIC_KEY_PEM],
    );

    const tokenSignedByPreviousKey = jwt.sign(
      buildAccessTokenPayload(sharedPayload),
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
    expect(data?.currentUser?.id).toBe(sharedPayload.userId);
  });

  it('rejects a token signed by a revoked kid (publicKey present, revokedAt set)', async () => {
    await global.testDataSource.query(
      `INSERT INTO core."signingKey" ("id", "publicKey", "privateKey", "isCurrent", "revokedAt")
       VALUES ($1, $2, NULL, false, NOW())
       ON CONFLICT ("id") DO UPDATE SET "revokedAt" = NOW(), "isCurrent" = false`,
      [REVOKED_KID, PREVIOUS_PUBLIC_KEY_PEM],
    );

    const tokenSignedByRevokedKey = jwt.sign(
      buildAccessTokenPayload(sharedPayload),
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
      buildAccessTokenPayload(sharedPayload),
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
});
