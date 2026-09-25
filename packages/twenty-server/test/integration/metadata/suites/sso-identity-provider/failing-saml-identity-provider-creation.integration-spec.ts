import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { SAML_IDENTITY_PROVIDER_CERTIFICATE } from 'test/integration/metadata/suites/sso-identity-provider/constants/saml-identity-provider-certificate.constant';
import { createOneSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-saml-identity-provider.util';
import { v4 as uuidv4 } from 'uuid';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// The harness only holds sessions of the Apple workspace, so the existing
// identity provider is inserted directly into the other seeded workspace.
describe('SAML identity provider creation should fail', () => {
  const existingIdentityProvider = {
    id: uuidv4(),
    name: 'Existing identity provider',
    issuer: 'https://existing-identity-provider.example.com',
    ssoURL: 'https://existing-identity-provider.example.com/sso',
    certificate: SAML_IDENTITY_PROVIDER_CERTIFICATE,
    workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
  };

  beforeAll(async () => {
    await globalThis.testDataSource.query(
      `INSERT INTO core."workspaceSSOIdentityProvider"
         ("id", "name", "type", "issuer", "ssoURL", "certificate", "workspaceId")
       VALUES ($1, $2, 'SAML', $3, $4, $5, $6)`,
      [
        existingIdentityProvider.id,
        existingIdentityProvider.name,
        existingIdentityProvider.issuer,
        existingIdentityProvider.ssoURL,
        existingIdentityProvider.certificate,
        existingIdentityProvider.workspaceId,
      ],
    );
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
      [existingIdentityProvider.id],
    );
  });

  it('when the id is already used by an identity provider', async () => {
    const { errors } = await createOneSamlIdentityProvider({
      expectToFail: true,
      input: {
        id: existingIdentityProvider.id,
        name: 'Identity provider',
        issuer: 'https://identity-provider.example.com',
        ssoURL: 'https://identity-provider.example.com/sso',
        certificate: SAML_IDENTITY_PROVIDER_CERTIFICATE,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });

    const [identityProvider] = await globalThis.testDataSource.query(
      `SELECT "id", "name", "issuer", "ssoURL", "certificate", "workspaceId"
       FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
      [existingIdentityProvider.id],
    );

    expect(identityProvider).toEqual(existingIdentityProvider);
  });
});
