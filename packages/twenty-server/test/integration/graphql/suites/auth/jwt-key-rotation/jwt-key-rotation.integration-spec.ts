import { createHash, randomUUID } from 'crypto';

import * as jwt from 'jsonwebtoken';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
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
  CURRENT_KID,
  PREVIOUS_KID,
  PREVIOUS_PRIVATE_KEY_PEM,
  PREVIOUS_PUBLIC_KEY_PEM,
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

  if (decoded === null || typeof decoded === 'string') {
    throw new Error('Failed to decode JWT');
  }

  return decoded;
};

let cleanupAccessToken: string | undefined;

const signUpFreshUserAndCreateWorkspace = async (suffix: string) => {
  const uniqueEmail = `jwt-rotation-${suffix}-${randomUUID()}@example.com`;

  const { data: signUpData } = await signUp({
    input: {
      email: uniqueEmail,
      password: 'Test123!@#',
    },
    expectToFail: false,
  });

  const workspaceAgnosticToken =
    signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

  cleanupAccessToken = workspaceAgnosticToken;

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

  const accessToken =
    tokensData.getAuthTokensFromLoginToken.tokens.accessOrWorkspaceAgnosticToken
      .token;

  const payload = jwt.decode(accessToken) as AccessTokenJwtPayload;

  cleanupAccessToken = accessToken;

  return { accessToken, payload };
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

describe('JWT Asymmetric Signing & Key Rotation (integration)', () => {
  beforeEach(() => {
    cleanupAccessToken = undefined;
  });

  afterEach(async () => {
    if (isDefined(cleanupAccessToken)) {
      try {
        await deleteUser({
          accessToken: cleanupAccessToken,
          expectToFail: false,
        });
      } catch {
        /* */
      }
    }

    await global.testDataSource.query(
      `DELETE FROM core."jwtPublicKey" WHERE "kid" = $1`,
      [PREVIOUS_KID],
    );
  });

  describe('New ES256 token (happy path)', () => {
    it('signs ACCESS tokens with ES256 + kid and persists the public key row', async () => {
      const { accessToken } =
        await signUpFreshUserAndCreateWorkspace('happy-path');

      const decoded = decodeJwtCompleteOrThrow(accessToken);

      expect(decoded.header.alg).toBe('ES256');
      expect(decoded.header.kid).toBe(CURRENT_KID);

      const rows = await global.testDataSource.query(
        `SELECT "kid", "algorithm", "status" FROM core."jwtPublicKey" WHERE "kid" = $1`,
        [CURRENT_KID],
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].algorithm).toBe('ES256');
      expect(rows[0].status).toBe('active');

      const { data, errors } = await getCurrentUser({
        accessToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data?.currentUser).toBeDefined();
    });
  });

  describe('Legacy HS256 fallback (no kid)', () => {
    it('verifies a hand-crafted no-kid HS256 ACCESS token via the legacy fallback', async () => {
      const { payload } =
        await signUpFreshUserAndCreateWorkspace('hs256-fallback');

      const legacyHs256Token = jwt.sign(
        buildAccessTokenPayload(payload),
        generateLegacyHs256Secret(
          JwtTokenTypeEnum.ACCESS,
          payload.workspaceId!,
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
      expect(data?.currentUser?.id).toBe(payload.userId);
    });
  });

  describe('Previous-key rotation simulation', () => {
    it('verifies a token signed by a hardcoded previous private key when its public key row pre-exists', async () => {
      const { payload } = await signUpFreshUserAndCreateWorkspace('rotation');

      await global.testDataSource.query(
        `INSERT INTO core."jwtPublicKey" ("kid", "publicKey", "algorithm", "status")
         VALUES ($1, $2, 'ES256', 'active')`,
        [PREVIOUS_KID, PREVIOUS_PUBLIC_KEY_PEM],
      );

      const tokenSignedByPreviousKey = jwt.sign(
        buildAccessTokenPayload(payload),
        PREVIOUS_PRIVATE_KEY_PEM,
        {
          algorithm: 'ES256',
          keyid: PREVIOUS_KID,
          expiresIn: '5m',
        },
      );

      const decoded = decodeJwtCompleteOrThrow(tokenSignedByPreviousKey);

      expect(decoded.header.alg).toBe('ES256');
      expect(decoded.header.kid).toBe(PREVIOUS_KID);
      expect(decoded.header.kid).not.toBe(CURRENT_KID);

      const { data, errors } = await getCurrentUser({
        accessToken: tokenSignedByPreviousKey,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data?.currentUser?.id).toBe(payload.userId);
    });
  });

  describe('Unknown kid rejected cleanly', () => {
    it('rejects a token whose kid was never registered without leaking a 500', async () => {
      const { payload } =
        await signUpFreshUserAndCreateWorkspace('unknown-kid');

      const unknownKid = `unknown-kid-${Date.now()}`;

      const tokenSignedByOrphanKey = jwt.sign(
        buildAccessTokenPayload(payload),
        PREVIOUS_PRIVATE_KEY_PEM,
        {
          algorithm: 'ES256',
          keyid: unknownKid,
          expiresIn: '5m',
        },
      );

      const { data, errors } = await getCurrentUser({
        accessToken: tokenSignedByOrphanKey,
        expectToFail: true,
      });

      expect(data?.currentUser).toBeFalsy();
      expect(errors).toBeDefined();
      expect(errors?.length).toBeGreaterThan(0);
      const internalServerError = errors?.find((error) =>
        (error as { message?: string }).message
          ?.toLowerCase?.()
          .includes('internal'),
      );

      expect(internalServerError).toBeUndefined();
    });
  });
});
