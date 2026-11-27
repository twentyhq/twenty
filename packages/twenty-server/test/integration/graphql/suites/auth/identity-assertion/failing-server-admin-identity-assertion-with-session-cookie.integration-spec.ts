import { getCurrentUserWithSessionCookie } from 'test/integration/graphql/suites/auth/cookie-session/utils/get-current-user-with-session-cookie.util';
import { signInAndGetSessionCookie } from 'test/integration/graphql/suites/auth/cookie-session/utils/sign-in-and-get-session-cookie.util';
import { mockServerAdminIdentityAssertionConfig } from 'test/integration/graphql/suites/auth/identity-assertion/utils/mock-server-admin-identity-assertion-config.util';
import { startIdentityAssertionIssuer } from 'test/integration/graphql/suites/auth/identity-assertion/utils/start-identity-assertion-issuer.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';

describe('Cookie-authenticated requests refused in the server admin workspace', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should keep the session cookie of a request refused for its identity assertion', async () => {
    const sessionCookie = await signInAndGetSessionCookie();
    const issuer = await startIdentityAssertionIssuer();

    mockServerAdminIdentityAssertionConfig({
      signingKeysUrl: issuer.signingKeysUrl,
    });

    const { errors, responseSessionCookie } =
      await getCurrentUserWithSessionCookie({
        sessionCookie,
        expectToFail: true,
      });

    expectOneNotInternalServerErrorSnapshot({ errors });
    expect(responseSessionCookie).toBeUndefined();

    jest.restoreAllMocks();
    await issuer.stop();

    const { errors: errorsOnceUnrestricted } =
      await getCurrentUserWithSessionCookie({
        sessionCookie,
        expectToFail: false,
      });

    expect(errorsOnceUnrestricted).toBeUndefined();
  });
});
