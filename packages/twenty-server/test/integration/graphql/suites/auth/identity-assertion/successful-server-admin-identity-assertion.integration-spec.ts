import { IDENTITY_ASSERTION_TEST_CONFIG } from 'test/integration/graphql/suites/auth/identity-assertion/utils/identity-assertion-test-config.constant';
import { mockServerAdminIdentityAssertionConfig } from 'test/integration/graphql/suites/auth/identity-assertion/utils/mock-server-admin-identity-assertion-config.util';
import {
  type IdentityAssertionIssuer,
  startIdentityAssertionIssuer,
} from 'test/integration/graphql/suites/auth/identity-assertion/utils/start-identity-assertion-issuer.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { getYcombinatorAdminAccessToken } from 'test/integration/sso/utils/get-ycombinator-admin-access-token.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

/* global APPLE_JANE_ADMIN_ACCESS_TOKEN */

type AcceptedAssertionTestContext = {
  algorithm: 'RS256' | 'ES256';
};

const acceptedAssertionTestCases: EachTestingContext<AcceptedAssertionTestContext>[] =
  [
    {
      title: 'signed with an RSA key',
      context: { algorithm: 'RS256' },
    },
    {
      title: 'signed with an elliptic curve key',
      context: { algorithm: 'ES256' },
    },
  ];

describe('Requests allowed with an identity-aware proxy in front of the server admin workspace', () => {
  let issuer: IdentityAssertionIssuer;
  let ycombinatorAccessToken: string;

  beforeAll(async () => {
    // Logged in before the restriction applies: the login helpers send the default Apple token.
    ycombinatorAccessToken = await getYcombinatorAdminAccessToken();
    issuer = await startIdentityAssertionIssuer();

    mockServerAdminIdentityAssertionConfig({
      signingKeysUrl: issuer.signingKeysUrl,
    });
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await issuer.stop();
  });

  it.each(eachTestingContextFilter(acceptedAssertionTestCases))(
    'should accept a request into the server admin workspace with an assertion issued to its user and $title',
    async ({ context }) => {
      const { data, errors } = await getCurrentUser({
        accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: false,
        headers: {
          [IDENTITY_ASSERTION_TEST_CONFIG.header]: issuer.signAssertion({
            email: 'Jane.Austen@Apple.dev',
            algorithm: context.algorithm,
          }),
        },
      });

      expect(errors).toBeUndefined();
      expect(data.currentUser.id).toBe(USER_DATA_SEED_IDS.JANE);
    },
  );

  it('should not require an assertion in another workspace', async () => {
    const { data, errors } = await getCurrentUser({
      accessToken: ycombinatorAccessToken,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.currentUser.id).toBe(USER_DATA_SEED_IDS.TIM);
  });
});
