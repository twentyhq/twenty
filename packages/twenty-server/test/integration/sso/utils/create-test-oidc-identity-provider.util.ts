import { createOneOidcIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-oidc-identity-provider.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';

export const createTestOidcIdentityProvider = async ({
  token,
  clientSecret,
}: {
  token?: string;
  clientSecret?: string;
} = {}) => {
  const testIdentityProvider = getSsoTestIdentityProvider();

  const { data } = await createOneOidcIdentityProvider({
    expectToFail: false,
    token,
    input: {
      name: 'SSO integration test identity provider',
      issuer: testIdentityProvider.oidc.issuer,
      clientID: testIdentityProvider.oidc.clientId,
      clientSecret: clientSecret ?? testIdentityProvider.oidc.clientSecret,
    },
  });

  return data.createOIDCIdentityProvider.id;
};
