import {
  type CloudflareAccessIssuer,
  startCloudflareAccessIssuer,
} from 'test/integration/graphql/suites/auth/cloudflare-access/utils/start-cloudflare-access-issuer.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { mockConfigVariables } from 'test/integration/utils/mock-config-variables.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { CLOUDFLARE_ACCESS_ASSERTION_HEADER } from 'src/engine/core-modules/auth/cloudflare-access/constants/cloudflare-access-assertion-header.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

/* global APPLE_JANE_ADMIN_ACCESS_TOKEN */

const AUDIENCE = 'server-admin-audience';
const JANE_EMAIL = 'jane.austen@apple.dev';

type RefusedRequestTestContext = {
  signAssertion: (issuer: CloudflareAccessIssuer) => string | undefined;
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
          issuer.signAssertion({ email: 'tim@apple.dev', audience: AUDIENCE }),
      },
    },
    {
      title: 'with an assertion that carries no email',
      context: {
        signAssertion: (issuer) => issuer.signAssertion({ audience: AUDIENCE }),
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
            audience: AUDIENCE,
            issuer: 'https://another-team.cloudflareaccess.com',
          }),
      },
    },
    {
      title: 'with an expired assertion',
      context: {
        signAssertion: (issuer) =>
          issuer.signAssertion({
            email: JANE_EMAIL,
            audience: AUDIENCE,
            expiresInSeconds: -60,
          }),
      },
    },
    {
      title: 'with an assertion signed by an unknown key',
      context: {
        signAssertion: (issuer) =>
          issuer.signAssertion({
            email: JANE_EMAIL,
            audience: AUDIENCE,
            signingKeyId: 'unknown-key-id',
          }),
      },
    },
  ];

describe('Requests into the server admin workspace behind Cloudflare Access', () => {
  let issuer: CloudflareAccessIssuer;

  beforeAll(async () => {
    issuer = await startCloudflareAccessIssuer();

    mockConfigVariables({
      SERVER_ADMIN_WORKSPACE_ID: SEED_APPLE_WORKSPACE_ID,
      CLOUDFLARE_ACCESS_ISSUER_URL: issuer.issuerUrl,
      CLOUDFLARE_ACCESS_SERVER_ADMIN_AUDIENCE: AUDIENCE,
      OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: ['127.0.0.1'],
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
          ? { [CLOUDFLARE_ACCESS_ASSERTION_HEADER]: assertion }
          : {},
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
