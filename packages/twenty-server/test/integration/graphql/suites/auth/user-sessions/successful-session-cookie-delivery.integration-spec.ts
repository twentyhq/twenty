import {
  extractSessionCookie,
  normalizeSessionCookieForSnapshot,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';

import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { USER_SESSION_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-secure-cookie-name.constant';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';
import { setupDatabaseConfigOverrideForSuite } from 'test/integration/graphql/suites/auth/user-sessions/utils/setup-database-config-override.util';

// SameSite=None forces Secure (browsers reject the combination without it),
// which is the one secure-deployment trigger reachable at runtime: SERVER_URL
// stays plain http in .env.test. The production combination (https SERVER_URL
// with the SameSite=Lax default) is covered by
// secure-deployment-session-cookie.integration-spec.ts under a dedicated app
// boot.
describe('successful session cookie delivery on a secure deployment (integration)', () => {
  setupDatabaseConfigOverrideForSuite('AUTH_COOKIE_SESSIONS_ENABLED', true);
  setupDatabaseConfigOverrideForSuite('AUTH_COOKIE_SAME_SITE', 'none');

  it('should deliver the host-locked secure cookie variant', async () => {
    const response = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });

    expect(
      extractSessionCookie(response, USER_SESSION_COOKIE_NAME),
    ).toBeUndefined();

    const secureSessionCookie = extractSessionCookie(
      response,
      USER_SESSION_SECURE_COOKIE_NAME,
    );

    expect(secureSessionCookie).toBeDefined();

    if (!secureSessionCookie) {
      throw new Error('Expected a secure session cookie');
    }

    // __Host- requires Secure, Path=/ and no Domain; browsers enforce the
    // prefix contract, so the snapshot pins host-only scoping.
    expect(
      normalizeSessionCookieForSnapshot(secureSessionCookie.rawCookie),
    ).toMatchSnapshot('secure-session-cookie');
  });
});
