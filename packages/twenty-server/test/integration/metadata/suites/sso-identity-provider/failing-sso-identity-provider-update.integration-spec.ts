import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { SAML_IDENTITY_PROVIDER_CERTIFICATE } from 'test/integration/metadata/suites/sso-identity-provider/constants/saml-identity-provider-certificate.constant';
import { insertSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/insert-saml-identity-provider.util';
import { updateOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/update-one-sso-identity-provider.util';
import { v4 as uuidv4 } from 'uuid';

import { SsoIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('SSO identity provider update should fail', () => {
  const otherWorkspaceIdentityProviderId = uuidv4();

  beforeAll(async () => {
    await insertSamlIdentityProvider({
      id: otherWorkspaceIdentityProviderId,
      name: 'Other workspace identity provider',
      issuer: 'https://other-identity-provider.example.com',
      ssoURL: 'https://other-identity-provider.example.com/sso',
      certificate: SAML_IDENTITY_PROVIDER_CERTIFICATE,
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
    });
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
      [otherWorkspaceIdentityProviderId],
    );
  });

  it('when the identity provider does not exist', async () => {
    const { errors } = await updateOneSsoIdentityProvider({
      expectToFail: true,
      input: { id: uuidv4(), status: SsoIdentityProviderStatus.Inactive },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when the identity provider belongs to another workspace', async () => {
    const { errors } = await updateOneSsoIdentityProvider({
      expectToFail: true,
      input: {
        id: otherWorkspaceIdentityProviderId,
        status: SsoIdentityProviderStatus.Inactive,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });

    const [{ status }] = await globalThis.testDataSource.query(
      `SELECT "status" FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
      [otherWorkspaceIdentityProviderId],
    );

    expect(status).toBe(SsoIdentityProviderStatus.Active);
  });
});
