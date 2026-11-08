import { createOneOidcIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-oidc-identity-provider.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('OIDC identity provider creation should succeed', () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  let identityProviderId: string | undefined;

  afterAll(async () => {
    if (isDefined(identityProviderId)) {
      await globalThis.testDataSource.query(
        `DELETE FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
        [identityProviderId],
      );
    }
  });

  it('should create an active OIDC identity provider from the discovered issuer', async () => {
    const { data } = await createOneOidcIdentityProvider({
      expectToFail: false,
      input: {
        name: 'OIDC identity provider',
        issuer: testIdentityProvider.issuer,
        clientID: testIdentityProvider.clientId,
        clientSecret: testIdentityProvider.clientSecret,
      },
    });

    identityProviderId = data.createOIDCIdentityProvider.id;

    expect(data.createOIDCIdentityProvider).toMatchObject({
      type: 'OIDC',
      name: 'OIDC identity provider',
      issuer: testIdentityProvider.issuer,
      status: 'Active',
    });

    const [storedIdentityProvider] = await globalThis.testDataSource.query(
      `SELECT "issuer", "clientID", "workspaceId"
       FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
      [identityProviderId],
    );

    expect(storedIdentityProvider).toEqual({
      issuer: testIdentityProvider.issuer,
      clientID: testIdentityProvider.clientId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  });
});
