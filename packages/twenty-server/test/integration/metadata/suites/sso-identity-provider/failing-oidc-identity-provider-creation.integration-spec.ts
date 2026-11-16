import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneOidcIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-oidc-identity-provider.util';

const IDENTITY_PROVIDER_NAME = 'Failing OIDC identity provider';

const countIdentityProvidersNamed = async (name: string) => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM core."workspaceSSOIdentityProvider" WHERE name = $1`,
    [name],
  );

  return count;
};

describe('OIDC identity provider creation should fail', () => {
  afterEach(async () => {
    expect(await countIdentityProvidersNamed(IDENTITY_PROVIDER_NAME)).toBe(0);
  });

  it('when the issuer is not a URL', async () => {
    const { errors } = await createOneOidcIdentityProvider({
      expectToFail: true,
      input: {
        name: IDENTITY_PROVIDER_NAME,
        issuer: 'not-a-url',
        clientID: 'client-id',
        clientSecret: 'client-secret',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when the issuer is on a private network', async () => {
    const { errors } = await createOneOidcIdentityProvider({
      expectToFail: true,
      input: {
        name: IDENTITY_PROVIDER_NAME,
        issuer: 'http://169.254.169.254',
        clientID: 'client-id',
        clientSecret: 'client-secret',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when the caller lacks the security permission', async () => {
    const { errors } = await createOneOidcIdentityProvider({
      expectToFail: true,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      input: {
        name: IDENTITY_PROVIDER_NAME,
        issuer: 'https://identity-provider.example.com',
        clientID: 'client-id',
        clientSecret: 'client-secret',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
