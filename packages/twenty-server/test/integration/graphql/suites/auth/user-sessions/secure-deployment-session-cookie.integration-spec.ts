import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';

import {
  extractSessionCookie,
  normalizeSessionCookieForSnapshot,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import { currentUserIdentityQueryFactory } from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

// The secure/insecure cookie branch is decided by configuration, never by the
// transport: isSecureDeployment() reads SERVER_URL. SERVER_URL is env-only, so
// unlike the SameSite=None side door this spec cannot flip it at runtime; it
// requires the app to have booted with an https SERVER_URL and skips
// otherwise. CI runs it as a dedicated jest invocation with
// SERVER_URL=https://localhost:3000, which exercises the exact production
// combination: __Host- name, Secure, and the SameSite=Lax default.
const isSecureDeployment = (process.env.SERVER_URL ?? '').startsWith(
  'https://',
);

const describeOnSecureDeployment = isSecureDeployment
  ? describe
  : describe.skip;

describeOnSecureDeployment(
  'session cookie on a production-like secure deployment (integration)',
  () => {
    let sessionToken: string;

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

    it('should deliver the production cookie: __Host- name, Secure, SameSite=Lax', async () => {
      const response = await signInWithCookieCapture({
        originHeader: ALLOWED_ORIGIN,
      });

      expect(extractSessionCookie(response, 'twenty-session')).toBeUndefined();

      const secureSessionCookie = extractSessionCookie(
        response,
        '__Host-twenty-session',
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
          cookieHeader: `__Host-twenty-session=${sessionToken}`,
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
          cookieHeader: `twenty-session=${sessionToken}`,
        },
      );

      expect(response.body.errors).toBeDefined();
    });
  },
);

// Keeps the file from being an empty suite on plain-http runs, where jest
// would otherwise fail the run.
if (!isSecureDeployment) {
  describe('session cookie on a production-like secure deployment (integration)', () => {
    it('is skipped: the app booted without an https SERVER_URL', () => {
      expect(isSecureDeployment).toBe(false);
    });
  });
}
