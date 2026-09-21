import {
  extractSessionCookie,
  hasClearingCookie,
  normalizeSessionCookieForSnapshot,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import {
  currentUserIdentityQueryFactory,
  signOutQueryFactory,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import {
  ALLOWED_ORIGIN,
  DISALLOWED_ORIGIN,
} from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';
import { IS_SECURE_DEPLOYMENT } from 'test/integration/graphql/suites/auth/user-sessions/constants/is-secure-deployment.constant';

import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { USER_SESSION_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-secure-cookie-name.constant';

// The secure/insecure cookie branch is decided by configuration, never by the
// transport: isSecureDeployment() reads SERVER_URL, which is env-only. This
// suite therefore needs the app booted with an https SERVER_URL, which
// jest-integration-secure.config.ts guarantees; run it through
// `nx run twenty-server:test:integration:secure`. It exercises the exact
// production combination: __Host- name, Secure, and the SameSite=Lax default.
describe('session cookie on a production-like secure deployment (integration)', () => {
  let sessionToken: string;

  beforeAll(() => {
    if (!IS_SECURE_DEPLOYMENT) {
      throw new Error(
        'This suite requires an https SERVER_URL; run it via nx run twenty-server:test:integration:secure',
      );
    }
  });

  it('should deliver the production cookie: __Host- name, Secure, SameSite=Lax', async () => {
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
      throw new Error('Expected the secure session cookie');
    }

    sessionToken = secureSessionCookie.sessionToken;

    // A literal rather than a snapshot: snapshots written by this dedicated
    // run would count as obsolete in the plain-http run.
    expect(
      normalizeSessionCookieForSnapshot(secureSessionCookie.rawCookie),
    ).toBe(
      '__Host-twenty-session=sess_<redacted>; Path=/; Expires=<redacted>; HttpOnly; Secure; SameSite=Lax',
    );
  });

  it('should authenticate a request presenting the __Host- cookie', async () => {
    const response = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: `${USER_SESSION_SECURE_COOKIE_NAME}=${sessionToken}`,
      },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.currentUser.email).toBe('tim@apple.dev');
  });

  it('should ignore the plain cookie name, refusing a downgrade', async () => {
    const response = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: `${USER_SESSION_COOKIE_NAME}=${sessionToken}`,
      },
    );

    expect(response.body.errors).toBeDefined();
  });

  it('should enforce the CSRF origin gate on __Host- cookie requests', async () => {
    const response = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: DISALLOWED_ORIGIN,
        cookieHeader: `${USER_SESSION_SECURE_COOKIE_NAME}=${sessionToken}`,
      },
      403,
    );

    expect(response.body.error).toBe('CSRF_ORIGIN_MISMATCH');
  });

  it('should clear the __Host- cookie on sign-out', async () => {
    const response = await postMetadataOperationWithHeaders(
      signOutQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: `${USER_SESSION_SECURE_COOKIE_NAME}=${sessionToken}`,
      },
    );

    expect(response.body.data.signOut).toBe(true);
    expect(hasClearingCookie(response, USER_SESSION_SECURE_COOKIE_NAME)).toBe(
      true,
    );
  });
});
