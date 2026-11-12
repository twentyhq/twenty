import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { SAML_IDENTITY_PROVIDER_CERTIFICATE } from 'test/integration/metadata/suites/sso-identity-provider/constants/saml-identity-provider-certificate.constant';
import { createOneSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-saml-identity-provider.util';
import { insertSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/insert-saml-identity-provider.util';
import { v4 as uuidv4 } from 'uuid';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

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
    await insertSamlIdentityProvider(existingIdentityProvider);
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

  it.each([
    {
      title: 'when the certificate is followed by a second certificate',
      certificate: `${SAML_IDENTITY_PROVIDER_CERTIFICATE}\n${SAML_IDENTITY_PROVIDER_CERTIFICATE}`,
    },
    {
      title: 'when the certificate is followed by trailing data',
      certificate: `${SAML_IDENTITY_PROVIDER_CERTIFICATE}\nQUJDRA==`,
    },
  ])('$title', async ({ certificate }) => {
    const id = uuidv4();

    const { errors } = await createOneSamlIdentityProvider({
      expectToFail: true,
      input: {
        id,
        name: 'Identity provider',
        issuer: 'https://identity-provider.example.com',
        ssoURL: 'https://identity-provider.example.com/sso',
        certificate,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });

    const identityProviders = await globalThis.testDataSource.query(
      `SELECT "id" FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
      [id],
    );

    expect(identityProviders).toEqual([]);
  });
});
