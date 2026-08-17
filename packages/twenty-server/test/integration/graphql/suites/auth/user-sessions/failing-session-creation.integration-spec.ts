import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  extractSessionCookie,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';

import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';

import {
  ALLOWED_ORIGIN,
  DISALLOWED_ORIGIN,
} from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

describe('failing user session creation on auth exchanges (integration)', () => {
  it('should refuse the cookie but still return tokens on a sign-in from a disallowed origin (login-CSRF)', async () => {
    const userSessionRepository =
      getCoreRepository<UserSessionEntity>(UserSessionEntity);
    const sessionCountBefore = await userSessionRepository.count();

    const response = await signInWithCookieCapture({
      originHeader: DISALLOWED_ORIGIN,
    });

    expect(
      response.body.data.getAuthTokensFromLoginToken.tokens.refreshToken.token,
    ).toBeDefined();
    expect(extractSessionCookie(response)).toBeUndefined();

    const sessionCountAfter = await userSessionRepository.count();

    expect(sessionCountAfter).toBe(sessionCountBefore);
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
