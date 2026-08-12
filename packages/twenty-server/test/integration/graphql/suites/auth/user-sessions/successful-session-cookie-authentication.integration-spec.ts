import {
  extractSessionCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import { currentUserIdentityQueryFactory } from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';
import { setupDatabaseConfigOverrideForSuite } from 'test/integration/graphql/suites/auth/user-sessions/utils/setup-database-config-override.util';

describe('successful session cookie authentication (integration)', () => {
  setupDatabaseConfigOverrideForSuite('AUTH_COOKIE_SESSIONS_ENABLED', true);

  let sessionCookieHeader: string;

  beforeAll(async () => {
    const signInResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });
    const sessionCookie = extractSessionCookie(signInResponse);

    if (!sessionCookie) {
      throw new Error('Expected a session cookie from sign-in');
    }

    sessionCookieHeader = sessionCookie.cookieHeader;
  });

  it('should authenticate a request carrying only the session cookie', async () => {
    const response = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: sessionCookieHeader,
      },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.currentUser).toMatchObject({
      id: USER_DATA_SEED_IDS.TIM,
      email: 'tim@apple.dev',
    });
  });
});
