import { SAML_IDENTITY_PROVIDER_CERTIFICATE } from 'test/integration/metadata/suites/sso-identity-provider/constants/saml-identity-provider-certificate.constant';
import { createOneSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-saml-identity-provider.util';
import { findPublicWorkspaceSsoIdentityProviders } from 'test/integration/metadata/suites/sso-identity-provider/utils/find-public-workspace-sso-identity-providers.util';
import { findSsoIdentityProviders } from 'test/integration/metadata/suites/sso-identity-provider/utils/find-sso-identity-providers.util';
import { insertSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/insert-saml-identity-provider.util';
import { updateOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/update-one-sso-identity-provider.util';
import { v4 as uuidv4 } from 'uuid';

import { SsoIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLE_LOGIN_PAGE_ORIGIN = 'http://apple.localhost:3001';

const buildSamlIdentityProviderInput = ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => ({
  id,
  name,
  issuer: `https://${id}.example.com`,
  ssoURL: `https://${id}.example.com/sso`,
  certificate: SAML_IDENTITY_PROVIDER_CERTIFICATE,
});

describe('SSO identity provider listing should succeed', () => {
  const activeIdentityProviderId = uuidv4();
  const inactiveIdentityProviderId = uuidv4();
  const otherWorkspaceIdentityProviderId = uuidv4();

  beforeAll(async () => {
    await createOneSamlIdentityProvider({
      expectToFail: false,
      input: buildSamlIdentityProviderInput({
        id: activeIdentityProviderId,
        name: 'Active identity provider',
      }),
    });

    await createOneSamlIdentityProvider({
      expectToFail: false,
      input: buildSamlIdentityProviderInput({
        id: inactiveIdentityProviderId,
        name: 'Inactive identity provider',
      }),
    });

    await updateOneSsoIdentityProvider({
      expectToFail: false,
      input: {
        id: inactiveIdentityProviderId,
        status: SsoIdentityProviderStatus.Inactive,
      },
    });

    await insertSamlIdentityProvider({
      ...buildSamlIdentityProviderInput({
        id: otherWorkspaceIdentityProviderId,
        name: 'Other workspace identity provider',
      }),
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
    });
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."workspaceSSOIdentityProvider" WHERE id = ANY($1)`,
      [
        [
          activeIdentityProviderId,
          inactiveIdentityProviderId,
          otherWorkspaceIdentityProviderId,
        ],
      ],
    );
  });

  it('should list every identity provider of the workspace only', async () => {
    const { data } = await findSsoIdentityProviders();

    expect(data.getSSOIdentityProviders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: activeIdentityProviderId,
          name: 'Active identity provider',
          type: 'SAML',
          status: SsoIdentityProviderStatus.Active,
        }),
        expect.objectContaining({
          id: inactiveIdentityProviderId,
          name: 'Inactive identity provider',
          type: 'SAML',
          status: SsoIdentityProviderStatus.Inactive,
        }),
      ]),
    );
    expect(data.getSSOIdentityProviders.map(({ id }) => id)).not.toContain(
      otherWorkspaceIdentityProviderId,
    );
  });

  it('should offer only active identity providers on the workspace login page', async () => {
    const loginPageIdentityProviderIds = (
      await findPublicWorkspaceSsoIdentityProviders(APPLE_LOGIN_PAGE_ORIGIN)
    ).map(({ id }) => id);

    expect(loginPageIdentityProviderIds).toContain(activeIdentityProviderId);
    expect(loginPageIdentityProviderIds).not.toContain(
      inactiveIdentityProviderId,
    );
    expect(loginPageIdentityProviderIds).not.toContain(
      otherWorkspaceIdentityProviderId,
    );
  });
});
