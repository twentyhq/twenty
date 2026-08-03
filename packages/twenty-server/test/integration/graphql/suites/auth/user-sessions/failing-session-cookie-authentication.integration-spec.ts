import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import {
  extractSessionCookie,
  hasClearingCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import { currentUserIdentityQueryFactory } from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { generateUserSessionToken } from 'src/engine/core-modules/user-session/utils/generate-user-session-token.util';

import {
  ALLOWED_ORIGIN,
  DISALLOWED_ORIGIN,
} from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

describe('failing session cookie authentication (integration)', () => {
  let sessionToken: string;

  beforeAll(async () => {
    await createConfigVariable({
      input: { key: 'AUTH_COOKIE_SESSIONS_ENABLED', value: true },
    });

    const signInResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });
    const sessionCookie = extractSessionCookie(signInResponse);

    if (!sessionCookie) {
      throw new Error('Expected a session cookie from sign-in');
    }

    sessionToken = sessionCookie.sessionToken;
  });

  afterAll(async () => {
    await deleteConfigVariable({
      input: { key: 'AUTH_COOKIE_SESSIONS_ENABLED' },
    }).catch(() => {});
  });

  it('should reject a session token presented as a Bearer header', async () => {
    // Cookie-only by design: accepting sess_ tokens as Bearer would reopen
    // the XSS-exfiltration surface cookie sessions close.
    const response = await makeMetadataAPIRequest(
      currentUserIdentityQueryFactory(),
      sessionToken,
    ).expect(200);

    expect(response.body.data).toBeUndefined();
    expect(response.body.errors).toBeDefined();
  });

  it('should return 403 on a cookie-authenticated request from a disallowed origin', async () => {
    const response = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: DISALLOWED_ORIGIN,
        cookieHeader: `twenty-session=${sessionToken}`,
      },
      403,
    );

    expect(response.body.error).toBe('CSRF_ORIGIN_MISMATCH');
  });

  it('should return 403 on a cookie-authenticated request without an Origin header, failing closed', async () => {
    const response = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      { cookieHeader: `twenty-session=${sessionToken}` },
      403,
    );

    expect(response.body.error).toBe('CSRF_ORIGIN_MISMATCH');
  });

  it('should treat an unknown session token as unauthenticated and clear the dead cookie', async () => {
    const unknownSessionToken = generateUserSessionToken();

    const response = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: `twenty-session=${unknownSessionToken}`,
      },
    );

    expect(response.body.errors).toBeDefined();
    expect(hasClearingCookie(response)).toBe(true);
  });
});
