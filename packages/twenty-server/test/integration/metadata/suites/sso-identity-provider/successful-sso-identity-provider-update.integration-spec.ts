import { SAML_IDENTITY_PROVIDER_CERTIFICATE } from 'test/integration/metadata/suites/sso-identity-provider/constants/saml-identity-provider-certificate.constant';
import { createOneSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-saml-identity-provider.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { findSsoIdentityProviders } from 'test/integration/metadata/suites/sso-identity-provider/utils/find-sso-identity-providers.util';
import { updateOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/update-one-sso-identity-provider.util';
import { v4 as uuidv4 } from 'uuid';

import { SsoIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

describe('SSO identity provider update should succeed', () => {
  let identityProviderId: string;

  const findListedStatus = async () => {
    const { data } = await findSsoIdentityProviders();

    return data.getSSOIdentityProviders.find(
      ({ id }) => id === identityProviderId,
    )?.status;
  };

  beforeEach(async () => {
    identityProviderId = uuidv4();

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

  afterEach(async () => {
    await deleteOneSsoIdentityProvider({
      identityProviderId,
      expectToFail: false,
    });
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
    expect(await findListedStatus()).toBe(SsoIdentityProviderStatus.Inactive);
  });

  it('should reactivate an identity provider', async () => {
    await updateOneSsoIdentityProvider({
      expectToFail: false,
      input: {
        id: identityProviderId,
        status: SsoIdentityProviderStatus.Inactive,
      },
    });

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
    expect(await findListedStatus()).toBe(SsoIdentityProviderStatus.Active);
  });
});
