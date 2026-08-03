import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
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

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

describe('successful sign-out (integration)', () => {
  beforeAll(async () => {
    await createConfigVariable({
      input: { key: 'AUTH_COOKIE_SESSIONS_ENABLED', value: true },
    });
  });

  afterAll(async () => {
    await deleteConfigVariable({
      input: { key: 'AUTH_COOKIE_SESSIONS_ENABLED' },
    }).catch(() => {});
  });

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
    const response = await postMetadataOperationWithHeaders(
      signOutQueryFactory(),
      { originHeader: ALLOWED_ORIGIN },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.signOut).toBe(true);
    expect(hasClearingCookie(response)).toBe(false);
  });
});
