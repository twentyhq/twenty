import request from 'supertest';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { IGNORE_SESSION_COOKIE_HEADER_NAME } from 'twenty-shared/constants';

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
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

const signInAndGetSessionCookie = async () => {
  const sessionCookie = extractSessionCookie(
    await signInWithCookieCapture({ originHeader: ALLOWED_ORIGIN }),
  );

  if (!sessionCookie) {
    throw new Error('Expected a session cookie from sign-in');
  }

  return sessionCookie;
};

describe('ignored session cookie (integration)', () => {
  it('should not authenticate with the session cookie, nor clear it, when the request carries the ignore header', async () => {
    const sessionCookie = await signInAndGetSessionCookie();

    const ignoredResponse = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: sessionCookie.cookieHeader,
        ignoreSessionCookie: true,
      },
    );

    expect(ignoredResponse.body.data?.currentUser).toBeUndefined();
    expect(ignoredResponse.body.errors).toBeDefined();
    expect(hasClearingCookie(ignoredResponse)).toBe(false);

    const unmarkedResponse = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: sessionCookie.cookieHeader,
      },
    );

    expect(unmarkedResponse.body.errors).toBeUndefined();
    expect(unmarkedResponse.body.data.currentUser.email).toBe('tim@apple.dev');
  });

  it('should not authenticate a REST request with the session cookie when it carries the ignore header', async () => {
    const sessionCookie = await signInAndGetSessionCookie();

    const restRequest = () =>
      request(`http://localhost:${APP_PORT}`)
        .get('/rest/companies?limit=1')
        .set('Origin', ALLOWED_ORIGIN)
        .set('Cookie', sessionCookie.cookieHeader);

    const unmarkedResponse = await restRequest();
    const ignoredResponse = await restRequest().set(
      IGNORE_SESSION_COOKIE_HEADER_NAME,
      '1',
    );

    expect(unmarkedResponse.status).toBe(200);
    expect(ignoredResponse.status).not.toBe(200);
    expect(ignoredResponse.body.data).toBeUndefined();
  });

  it('should neither revoke nor clear the session when signing out with the ignore header', async () => {
    const sessionCookie = await signInAndGetSessionCookie();

    const signOutResponse = await postMetadataOperationWithHeaders(
      signOutQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: sessionCookie.cookieHeader,
        ignoreSessionCookie: true,
      },
    );

    expect(signOutResponse.body.data.signOut).toBe(true);
    expect(hasClearingCookie(signOutResponse)).toBe(false);

    const sessionRow = await getCoreRepository<UserSessionEntity>(
      UserSessionEntity,
    ).findOneBy({
      tokenHash: hashUserSessionToken(sessionCookie.sessionToken),
    });

    expect(sessionRow?.revokedAt).toBeNull();
  });

  it('should not issue a session cookie when signing in with the ignore header', async () => {
    const signInResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
      ignoreSessionCookie: true,
    });

    expect(extractSessionCookie(signInResponse)).toBeUndefined();
  });
});
