import { createOneOidcIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-oidc-identity-provider.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { findSsoIdentityProviders } from 'test/integration/metadata/suites/sso-identity-provider/utils/find-sso-identity-providers.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { isDefined } from 'twenty-shared/utils';

describe('OIDC identity provider creation should succeed', () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  let identityProviderId: string | undefined;

  afterEach(async () => {
    if (isDefined(identityProviderId)) {
      await deleteOneSsoIdentityProvider({
        identityProviderId,
        expectToFail: false,
      });
    }
  });

  it('should create an active OIDC identity provider from the discovered issuer', async () => {
    const { data } = await createOneOidcIdentityProvider({
      expectToFail: false,
      input: {
        name: 'OIDC identity provider',
        issuer: testIdentityProvider.oidc.issuer,
        clientID: testIdentityProvider.oidc.clientId,
        clientSecret: testIdentityProvider.oidc.clientSecret,
      },
    });

    identityProviderId = data.createOIDCIdentityProvider.id;

    const expectedIdentityProvider = {
      id: identityProviderId,
      type: 'OIDC',
      name: 'OIDC identity provider',
      issuer: testIdentityProvider.oidc.issuer,
      status: 'Active',
    };

    expect(data.createOIDCIdentityProvider).toEqual(expectedIdentityProvider);

    const { data: listingData } = await findSsoIdentityProviders();

    expect(listingData.getSSOIdentityProviders).toContainEqual(
      expectedIdentityProvider,
    );
  });
});
