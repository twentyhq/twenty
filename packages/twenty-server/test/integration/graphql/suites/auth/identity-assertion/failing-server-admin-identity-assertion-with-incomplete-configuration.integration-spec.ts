import { IDENTITY_ASSERTION_TEST_CONFIG } from 'test/integration/graphql/suites/auth/identity-assertion/utils/identity-assertion-test-config.constant';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { mockConfigVariables } from 'test/integration/utils/mock-config-variables.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

/* global APPLE_JANE_ADMIN_ACCESS_TOKEN */

describe('Requests into the server admin workspace with an incomplete identity assertion configuration', () => {
  beforeAll(() => {
    mockConfigVariables({
      SERVER_ADMIN_WORKSPACE_ID: SEED_APPLE_WORKSPACE_ID,
      SERVER_ADMIN_IDENTITY_ASSERTION_HEADER:
        IDENTITY_ASSERTION_TEST_CONFIG.header,
      SERVER_ADMIN_IDENTITY_ASSERTION_JWKS_URL: undefined,
      SERVER_ADMIN_IDENTITY_ASSERTION_ISSUER:
        IDENTITY_ASSERTION_TEST_CONFIG.issuer,
      SERVER_ADMIN_IDENTITY_ASSERTION_AUDIENCE:
        IDENTITY_ASSERTION_TEST_CONFIG.audience,
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should refuse the request', async () => {
    const { errors } = await getCurrentUser({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
