import { SAML_IDENTITY_PROVIDER_CERTIFICATE } from 'test/integration/metadata/suites/sso-identity-provider/constants/saml-identity-provider-certificate.constant';
import { createOneSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-saml-identity-provider.util';
import { updateOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/update-one-sso-identity-provider.util';
import { v4 as uuidv4 } from 'uuid';

import { SsoIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

describe('SSO identity provider update should succeed', () => {
  const identityProviderId = uuidv4();

  const findStoredStatus = async () => {
    const [{ status }] = await globalThis.testDataSource.query(
      `SELECT "status" FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
      [identityProviderId],
    );

    return status;
  };

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

  it('should deactivate an identity provider', async () => {
    const { data } = await updateOneSsoIdentityProvider({
      expectToFail: false,
      input: {
        id: identityProviderId,
        status: SsoIdentityProviderStatus.Inactive,
      },
    });

    expect(data.editSSOIdentityProvider).toMatchObject({
      id: identityProviderId,
      type: 'SAML',
      status: SsoIdentityProviderStatus.Inactive,
    });
    expect(await findStoredStatus()).toBe(SsoIdentityProviderStatus.Inactive);
  });

  it('should reactivate an identity provider', async () => {
    const { data } = await updateOneSsoIdentityProvider({
      expectToFail: false,
      input: {
        id: identityProviderId,
        status: SsoIdentityProviderStatus.Active,
      },
    });

    expect(data.editSSOIdentityProvider).toMatchObject({
      id: identityProviderId,
      status: SsoIdentityProviderStatus.Active,
    });
    expect(await findStoredStatus()).toBe(SsoIdentityProviderStatus.Active);
  });
});
