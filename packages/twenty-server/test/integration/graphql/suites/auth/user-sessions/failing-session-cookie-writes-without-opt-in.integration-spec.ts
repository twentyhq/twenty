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

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

// Front component fetches send the page's cookies without the opt-in header: they must not change the browser's session.
describe('failing session cookie writes without the opt-in header (integration)', () => {
  it('should not set a session cookie when signing in', async () => {
    const signInResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
      omitSessionCookieOptIn: true,
    });

    expect(signInResponse.body.errors).toBeUndefined();
    expect(
      signInResponse.body.data.getAuthTokensFromLoginToken.tokens
        .accessOrWorkspaceAgnosticToken.token,
    ).toBeDefined();
    expect(extractSessionCookie(signInResponse)).toBeUndefined();
  });

  it('should neither revoke nor clear the session when signing out', async () => {
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
        cookieHeader: sessionCookie.cookieHeader,
        omitSessionCookieOptIn: true,
      },
    );

    expect(hasClearingCookie(signOutResponse)).toBe(false);

    const reuseResponse = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: sessionCookie.cookieHeader,
      },
    );

    expect(reuseResponse.body.errors).toBeUndefined();
  });
});
