import { createOneSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-saml-identity-provider.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';

export const createTestSamlIdentityProvider = async ({
  token,
  id,
  certificate,
}: {
  token?: string;
  id?: string;
  certificate?: string;
} = {}) => {
  const { saml } = getSsoTestIdentityProvider();

  const { data } = await createOneSamlIdentityProvider({
    expectToFail: false,
    token,
    input: {
      // The identity provider only posts to the callback URL of the fixed id
      id: id ?? saml.identityProviderId,
      name: 'SSO integration test identity provider',
      issuer: saml.issuer,
      ssoURL: saml.ssoUrl,
      certificate: certificate ?? saml.certificate,
    },
  });

  return data.createSAMLIdentityProvider.id;
};
