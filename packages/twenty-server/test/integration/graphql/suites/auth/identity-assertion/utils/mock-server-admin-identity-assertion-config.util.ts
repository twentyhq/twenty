import { IDENTITY_ASSERTION_TEST_CONFIG } from 'test/integration/graphql/suites/auth/identity-assertion/utils/identity-assertion-test-config.constant';
import { mockConfigVariables } from 'test/integration/utils/mock-config-variables.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const mockServerAdminIdentityAssertionConfig = ({
  signingKeysUrl,
}: {
  signingKeysUrl: string;
}) => {
  mockConfigVariables({
    SERVER_ADMIN_WORKSPACE_ID: SEED_APPLE_WORKSPACE_ID,
    SERVER_ADMIN_IDENTITY_ASSERTION_HEADER:
      IDENTITY_ASSERTION_TEST_CONFIG.header,
    SERVER_ADMIN_IDENTITY_ASSERTION_JWKS_URL: signingKeysUrl,
    SERVER_ADMIN_IDENTITY_ASSERTION_ISSUER:
      IDENTITY_ASSERTION_TEST_CONFIG.issuer,
    SERVER_ADMIN_IDENTITY_ASSERTION_AUDIENCE:
      IDENTITY_ASSERTION_TEST_CONFIG.audience,
    OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: ['127.0.0.1'],
  });
};
