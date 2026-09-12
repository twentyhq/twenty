import * as jwt from 'jsonwebtoken';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { forgeLegacyHs256Token } from 'test/integration/graphql/utils/forge-legacy-hs256-token.util';
import { getAuthTokensFromLoginTokenQueryFactory } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.query-factory.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  extractSessionCookie,
  hasClearingCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';

import { type LoginTokenJwtPayload } from 'src/engine/core-modules/auth/types/login-token-jwt-payload.type';
import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';

import {
  ALLOWED_ORIGIN,
  DISALLOWED_ORIGIN,
} from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

describe('failing user session creation on auth exchanges (integration)', () => {
  it('should fail the exchange when a disallowed origin cannot receive its required session cookie', async () => {
    const userSessionRepository =
      getCoreRepository<UserSessionEntity>(UserSessionEntity);
    const sessionCountBefore = await userSessionRepository.count();

    const response = await signInWithCookieCapture({
      originHeader: DISALLOWED_ORIGIN,
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.getAuthTokensFromLoginToken).toBeFalsy();
    expect(extractSessionCookie(response)).toBeUndefined();

    const sessionCountAfter = await userSessionRepository.count();

    expect(sessionCountAfter).toBe(sessionCountBefore);
  });

  it('should preserve the presented session when replacement session creation fails', async () => {
    const existingSessionResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });
    const existingSessionCookie = extractSessionCookie(existingSessionResponse);

    if (!existingSessionCookie) {
      throw new Error('Expected an existing session cookie');
    }

    const workspaceOrigin = buildAppleWorkspaceOrigin();
    const loginTokenResponse = await postMetadataOperationWithHeaders(
      getLoginTokenFromCredentialsQueryFactory({
        email: 'tim@apple.dev',
        password: 'tim@apple.dev',
        origin: workspaceOrigin,
      }),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: existingSessionCookie.cookieHeader,
      },
    );
    const validLoginToken =
      loginTokenResponse.body.data.getLoginTokenFromCredentials.loginToken
        .token;
    const validPayload = jwt.decode(validLoginToken) as LoginTokenJwtPayload;
    const loginTokenWithoutProvider = forgeLegacyHs256Token(
      {
        sub: validPayload.sub,
        type: validPayload.type,
        workspaceId: validPayload.workspaceId,
      },
      validPayload.workspaceId,
    );

    const failedExchangeResponse = await postMetadataOperationWithHeaders(
      getAuthTokensFromLoginTokenQueryFactory({
        loginToken: loginTokenWithoutProvider,
        origin: workspaceOrigin,
      }),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: existingSessionCookie.cookieHeader,
      },
    );

    expect(failedExchangeResponse.body.errors).toBeDefined();
    expect(
      failedExchangeResponse.body.data?.getAuthTokensFromLoginToken,
    ).toBeFalsy();
    expect(extractSessionCookie(failedExchangeResponse)).toBeUndefined();
    expect(hasClearingCookie(failedExchangeResponse)).toBe(false);

    const existingSession = await getCoreRepository<UserSessionEntity>(
      UserSessionEntity,
    ).findOneBy({
      tokenHash: hashUserSessionToken(existingSessionCookie.sessionToken),
    });

    expect(existingSession?.revokedAt).toBeNull();
  });

  it('should mint nothing when the credentials exchange itself fails', async () => {
    const userSessionRepository =
      getCoreRepository<UserSessionEntity>(UserSessionEntity);
    const sessionCountBefore = await userSessionRepository.count();

    const response = await makeMetadataAPIRequest(
      getLoginTokenFromCredentialsQueryFactory({
        email: 'tim@apple.dev',
        password: 'wrong-password',
        origin: buildAppleWorkspaceOrigin(),
      }),
      null,
    )
      .set('Origin', ALLOWED_ORIGIN)
      .expect(200);

    expect(response.body.errors).toBeDefined();
    expect(extractSessionCookie(response)).toBeUndefined();

    const sessionCountAfter = await userSessionRepository.count();

    expect(sessionCountAfter).toBe(sessionCountBefore);
  });
});
