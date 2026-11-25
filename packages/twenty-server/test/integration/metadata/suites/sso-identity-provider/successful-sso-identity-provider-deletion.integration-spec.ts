import { SAML_IDENTITY_PROVIDER_CERTIFICATE } from 'test/integration/metadata/suites/sso-identity-provider/constants/saml-identity-provider-certificate.constant';
import { createOneSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-saml-identity-provider.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { v4 as uuidv4 } from 'uuid';

describe('SSO identity provider deletion should succeed', () => {
  const identityProviderId = uuidv4();

  beforeAll(async () => {
    await createOneSamlIdentityProvider({
      expectToFail: false,
      input: {
        id: identityProviderId,
        name: 'Identity provider',
        issuer: 'https://identity-provider.example.com',
        ssoURL: 'https://identity-provider.example.com/sso',
        certificate: SAML_IDENTITY_PROVIDER_CERTIFICATE,
      },
    });
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
      [identityProviderId],
    );
  });

  it('should delete an identity provider', async () => {
    const { data } = await deleteOneSsoIdentityProvider({
      identityProviderId,
      expectToFail: false,
    });

    expect(data.deleteSSOIdentityProvider).toEqual({ identityProviderId });

    const storedIdentityProviders = await globalThis.testDataSource.query(
      `SELECT "id" FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
      [identityProviderId],
    );

    expect(storedIdentityProviders).toEqual([]);
  });
});
