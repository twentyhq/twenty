import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';

import {
  extractSessionCookie,
  normalizeSessionCookieForSnapshot,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

// SameSite=None forces Secure (browsers reject the combination without it),
// which is the one secure-deployment trigger reachable at runtime: SERVER_URL
// stays plain http in .env.test. The production combination (https SERVER_URL
// with the SameSite=Lax default) is covered by
// secure-deployment-session-cookie.integration-spec.ts under a dedicated app
// boot.
describe('successful session cookie delivery on a secure deployment (integration)', () => {
  beforeAll(async () => {
    await createConfigVariable({
      input: { key: 'AUTH_COOKIE_SESSIONS_ENABLED', value: true },
    });
    await createConfigVariable({
      input: { key: 'AUTH_COOKIE_SAME_SITE', value: 'none' },
    });
  });

  afterAll(async () => {
    await deleteConfigVariable({
      input: { key: 'AUTH_COOKIE_SAME_SITE' },
    }).catch(() => {});
    await deleteConfigVariable({
      input: { key: 'AUTH_COOKIE_SESSIONS_ENABLED' },
    }).catch(() => {});
  });

  it('should deliver the host-locked secure cookie variant', async () => {
    const response = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });

    expect(
      extractSessionCookie(response, 'twenty-session'),
    ).toBeUndefined();

    const secureSessionCookie = extractSessionCookie(
      response,
      '__Host-twenty-session',
    );

    expect(secureSessionCookie).toBeDefined();

    if (!secureSessionCookie) {
      throw new Error('Expected a secure session cookie');
    }

    // __Host- requires Secure, Path=/ and no Domain; browsers enforce the
    // prefix contract, so the snapshot pins host-only scoping.
    expect(
      normalizeSessionCookieForSnapshot(secureSessionCookie.rawCookie),
    ).toMatchSnapshot('secure-session-cookie');
  });
});
