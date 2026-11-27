import { IDENTITY_ASSERTION_TEST_CONFIG } from 'test/integration/graphql/suites/auth/identity-assertion/utils/identity-assertion-test-config.constant';
import { mockServerAdminIdentityAssertionConfig } from 'test/integration/graphql/suites/auth/identity-assertion/utils/mock-server-admin-identity-assertion-config.util';
import {
  type IdentityAssertionIssuer,
  startIdentityAssertionIssuer,
} from 'test/integration/graphql/suites/auth/identity-assertion/utils/start-identity-assertion-issuer.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

/* global APPLE_JANE_ADMIN_ACCESS_TOKEN */

const JANE_EMAIL = 'jane.austen@apple.dev';

type RefusedRequestTestContext = {
  signAssertion: (issuer: IdentityAssertionIssuer) => string | undefined;
};

const refusedRequestTestCases: EachTestingContext<RefusedRequestTestContext>[] =
  [
    {
      title: 'without an assertion',
      context: {
        signAssertion: () => undefined,
      },
    },
    {
      title: 'with an assertion issued to another user',
      context: {
        signAssertion: (issuer) =>
          issuer.signAssertion({ email: 'tim@apple.dev' }),
      },
    },
    {
      title: 'with an assertion that carries no email',
      context: {
        signAssertion: (issuer) => issuer.signAssertion({}),
      },
    },
    {
      title: 'with an assertion for another audience',
      context: {
        signAssertion: (issuer) =>
          issuer.signAssertion({
            email: JANE_EMAIL,
            audience: 'another-audience',
          }),
      },
    },
    {
      title: 'with an assertion from another issuer',
      context: {
        signAssertion: (issuer) =>
          issuer.signAssertion({
            email: JANE_EMAIL,
            issuer: 'https://another-identity-proxy.test',
          }),
      },
    },
    {
      title: 'with an expired assertion',
      context: {
        signAssertion: (issuer) =>
          issuer.signAssertion({ email: JANE_EMAIL, expiresInSeconds: -60 }),
      },
    },
    {
      title: 'with an assertion signed by an unknown key',
      context: {
        signAssertion: (issuer) =>
          issuer.signAssertion({
            email: JANE_EMAIL,
            signingKeyId: 'unknown-key-id',
          }),
      },
    },
  ];

describe('Requests refused in the server admin workspace behind an identity-aware proxy', () => {
  let issuer: IdentityAssertionIssuer;

  beforeAll(async () => {
    issuer = await startIdentityAssertionIssuer();

    mockServerAdminIdentityAssertionConfig({
      signingKeysUrl: issuer.signingKeysUrl,
    });
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await issuer.stop();
  });

  it.each(eachTestingContextFilter(refusedRequestTestCases))(
    'should refuse a request $title',
    async ({ context }) => {
      const assertion = context.signAssertion(issuer);

      const { errors } = await getCurrentUser({
        accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        expectToFail: true,
        headers: isDefined(assertion)
          ? { [IDENTITY_ASSERTION_TEST_CONFIG.header]: assertion }
          : {},
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
