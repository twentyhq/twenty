import { createOneSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-saml-identity-provider.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';

// The id is fixed because the identity provider only posts to the callback URL registered with it
export const createTestSamlIdentityProvider = async ({
  token,
}: {
  token?: string;
} = {}) => {
  const { saml } = getSsoTestIdentityProvider();

  const { data } = await createOneSamlIdentityProvider({
    expectToFail: false,
    token,
    input: {
      id: saml.identityProviderId,
      name: 'SSO integration test identity provider',
      issuer: saml.issuer,
      ssoURL: saml.ssoUrl,
      certificate: saml.certificate,
    },
  });

  return data.createSAMLIdentityProvider.id;
};
