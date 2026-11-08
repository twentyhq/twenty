import { insertOidcIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/insert-oidc-identity-provider.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { v4 as uuidv4 } from 'uuid';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// Only Apple has a test session, so the YCombinator provider is inserted directly
export const insertOtherWorkspaceOidcIdentityProvider = async () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  const identityProviderId = uuidv4();

  await insertOidcIdentityProvider({
    id: identityProviderId,
    name: 'Other workspace identity provider',
    issuer: testIdentityProvider.issuer,
    clientID: testIdentityProvider.clientId,
    clientSecret: testIdentityProvider.clientSecret,
    workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
  });

  return identityProviderId;
};
