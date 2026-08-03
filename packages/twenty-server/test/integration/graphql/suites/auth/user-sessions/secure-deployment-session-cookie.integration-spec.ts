
import {
  extractSessionCookie,
  normalizeSessionCookieForSnapshot,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import { currentUserIdentityQueryFactory } from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';
import { IS_SECURE_DEPLOYMENT } from 'test/integration/graphql/suites/auth/user-sessions/constants/is-secure-deployment.constant';
import { setupDatabaseConfigOverrideForSuite } from 'test/integration/graphql/suites/auth/user-sessions/utils/setup-database-config-override.util';

import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { USER_SESSION_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-secure-cookie-name.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

// This spec requires the app to have booted with an https SERVER_URL and skips
// otherwise. CI runs it as a dedicated jest invocation with
// SERVER_URL=https://localhost:3000, which exercises the exact production
// combination: __Host- name, Secure, and the SameSite=Lax default.
const describeOnSecureDeployment = IS_SECURE_DEPLOYMENT
  ? describe
  : describe.skip;

describeOnSecureDeployment(
  'session cookie on a production-like secure deployment (integration)',
  () => {
    setupDatabaseConfigOverrideForSuite('AUTH_COOKIE_SESSIONS_ENABLED', true);

    let sessionToken: string;

    it('should deliver the production cookie: __Host- name, Secure, SameSite=Lax', async () => {
      const response = await signInWithCookieCapture({
        originHeader: ALLOWED_ORIGIN,
      });

      expect(extractSessionCookie(response, USER_SESSION_COOKIE_NAME)).toBeUndefined();

      const secureSessionCookie = extractSessionCookie(
        response,
        USER_SESSION_SECURE_COOKIE_NAME,
      );

      expect(secureSessionCookie).toBeDefined();

      if (!secureSessionCookie) {
        throw new Error('Expected the secure session cookie');
      }

      sessionToken = secureSessionCookie.sessionToken;

      // A literal rather than a snapshot: the suite skips on plain-http
      // boots, and a committed snapshot of skipped tests fails --ci runs as
      // obsolete.
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
      expect(response.body.data.currentUser).toMatchObject({
        id: USER_DATA_SEED_IDS.TIM,
        email: 'tim@apple.dev',
      });
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
  },
);
