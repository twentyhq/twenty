import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  extractSessionCookie,
  hasClearingCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import {
  currentUserIdentityQueryFactory,
  signOutQueryFactory,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';

import {
  ALLOWED_ORIGIN,
  DISALLOWED_ORIGIN,
} from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';
import { setupDatabaseConfigOverrideForSuite } from 'test/integration/graphql/suites/auth/user-sessions/utils/setup-database-config-override.util';

describe('successful sign-out (integration)', () => {
  setupDatabaseConfigOverrideForSuite('AUTH_COOKIE_SESSIONS_ENABLED', true);

  it('should revoke the presented session, clear the cookie, and reject its reuse', async () => {
    const signInResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });
    const sessionCookie = extractSessionCookie(signInResponse);

    if (!sessionCookie) {
      throw new Error('Expected a session cookie from sign-in');
    }

    const signOutResponse = await postMetadataOperationWithHeaders(
      signOutQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: `twenty-session=${sessionCookie.sessionToken}`,
      },
    );

    expect(signOutResponse.body.errors).toBeUndefined();
    expect(signOutResponse.body.data.signOut).toBe(true);
    expect(hasClearingCookie(signOutResponse)).toBe(true);

    const revokedRow = await getCoreRepository<UserSessionEntity>(
      UserSessionEntity,
    ).findOneBy({
      tokenHash: hashUserSessionToken(sessionCookie.sessionToken),
    });

    expect(revokedRow?.revokedAt).not.toBeNull();
    expect(revokedRow?.revokedReason).toBe(
      UserSessionRevokedReason.UserSignOut,
    );

    // Revocation invalidates the cache, so reuse fails immediately, not
    // after the cache TTL.
    const reuseResponse = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: `twenty-session=${sessionCookie.sessionToken}`,
      },
    );

    expect(reuseResponse.body.errors).toBeDefined();
    expect(hasClearingCookie(reuseResponse)).toBe(true);
  });

  it('should not clear anything on a cookie-less sign-out, so a cross-site POST cannot log a visitor out', async () => {
    // What a cross-site forgery actually looks like server-side: SameSite=Lax
    // keeps the cookie off the request, and the attacker page's origin comes
    // along. CSRF does not apply (no cookie), so the mutation runs and must
    // still clear nothing.
    const response = await postMetadataOperationWithHeaders(
      signOutQueryFactory(),
      { originHeader: DISALLOWED_ORIGIN },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.signOut).toBe(true);
    expect(hasClearingCookie(response)).toBe(false);
  });
});
