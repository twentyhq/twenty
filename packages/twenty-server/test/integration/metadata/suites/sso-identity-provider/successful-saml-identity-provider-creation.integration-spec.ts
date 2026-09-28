import { SAML_IDENTITY_PROVIDER_CERTIFICATE } from 'test/integration/metadata/suites/sso-identity-provider/constants/saml-identity-provider-certificate.constant';
import { createOneSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-saml-identity-provider.util';
import { v4 as uuidv4 } from 'uuid';

describe('SAML identity provider creation should succeed', () => {
  const identityProviderId = uuidv4();

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
      [identityProviderId],
    );
  });

  it('should create an active SAML identity provider', async () => {
    const { data } = await createOneSamlIdentityProvider({
      expectToFail: false,
      input: {
        id: identityProviderId,
        name: 'Identity provider',
        issuer: 'https://identity-provider.example.com',
        ssoURL: 'https://identity-provider.example.com/sso',
        certificate: SAML_IDENTITY_PROVIDER_CERTIFICATE,
      },
    });

    expect(data.createSAMLIdentityProvider).toMatchObject({
      id: identityProviderId,
      type: 'SAML',
      name: 'Identity provider',
      status: 'Active',
    });
  });
});
