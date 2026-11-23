import { IDENTITY_ASSERTION_TEST_CONFIG } from 'test/integration/graphql/suites/auth/identity-assertion/utils/identity-assertion-test-config.constant';
import { mockServerAdminIdentityAssertionConfig } from 'test/integration/graphql/suites/auth/identity-assertion/utils/mock-server-admin-identity-assertion-config.util';
import { startIdentityAssertionIssuer } from 'test/integration/graphql/suites/auth/identity-assertion/utils/start-identity-assertion-issuer.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';

/* global APPLE_JANE_ADMIN_ACCESS_TOKEN */

describe('Requests into the server admin workspace when its signing keys cannot be fetched', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should refuse a valid assertion', async () => {
    const issuer = await startIdentityAssertionIssuer();

    await issuer.stop();

    mockServerAdminIdentityAssertionConfig({
      signingKeysUrl: issuer.signingKeysUrl,
    });

    const { errors } = await getCurrentUser({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: true,
      headers: {
        [IDENTITY_ASSERTION_TEST_CONFIG.header]: issuer.signAssertion({
          email: 'jane.austen@apple.dev',
        }),
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
