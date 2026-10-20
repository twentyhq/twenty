import {
  extractSessionCookie,
  hasClearingCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import { currentUserIdentityQueryFactory } from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

describe('superseded session cookie retention (integration)', () => {
  it('should not clear the cookie when a superseded session is presented again', async () => {
    const firstSignInResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });
    const firstSessionCookie = extractSessionCookie(firstSignInResponse);

    if (!firstSessionCookie) {
      throw new Error('Expected a session cookie from sign-in');
    }

    const secondSignInResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
      cookieHeader: firstSessionCookie.cookieHeader,
    });

    expect(extractSessionCookie(secondSignInResponse)?.sessionToken).not.toBe(
      firstSessionCookie.sessionToken,
    );

    const staleResponse = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: firstSessionCookie.cookieHeader,
      },
    );

    expect(staleResponse.body.errors).toBeDefined();
    expect(staleResponse.body.errors[0].extensions.code).toBe(
      'UNAUTHENTICATED',
    );
    expect(hasClearingCookie(staleResponse)).toBe(false);
  });
});
