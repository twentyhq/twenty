import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { type ConnectionProviderManifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_PROVIDER_ID = uuidv4();

const buildProvider = (
  scope?: ConnectionProviderManifest['scope'],
): ConnectionProviderManifest => ({
  universalIdentifier: TEST_PROVIDER_ID,
  name: 'linear',
  displayName: 'Linear',
  type: 'oauth',
  ...(scope === undefined ? {} : { scope }),
  oauth: {
    authorizationEndpoint: 'https://linear.app/oauth/authorize',
    tokenEndpoint: 'https://api.linear.app/oauth/token',
    scopes: ['read'],
    clientIdVariable: 'LINEAR_CLIENT_ID',
    clientSecretVariable: 'LINEAR_CLIENT_SECRET',
  },
});

const syncProvider = (
  provider: ConnectionProviderManifest,
  { expectToFail = false }: { expectToFail?: boolean } = {},
) =>
  syncApplication({
    manifest: buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: { connectionProviders: [provider] },
    }),
    expectToFail,
  });

const findProviderScopes = async () =>
  (await findConnectionProvidersByApplication(TEST_APP_ID)).map(
    (provider) => provider.scope,
  );

describe('connection provider scope manifest sync', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing connection provider scopes',
      sourcePath: 'test-connection-provider-scope-sync',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('stores WORKSPACE when the manifest omits the scope', async () => {
    await syncProvider(buildProvider());

    expect(await findProviderScopes()).toEqual(['WORKSPACE']);
  }, 60000);

  it('stores the declared scope', async () => {
    await syncProvider(buildProvider('USER'));

    expect(await findProviderScopes()).toEqual(['USER']);
  }, 60000);

  it('applies a scope change on a later sync', async () => {
    await syncProvider(buildProvider('WORKSPACE'));
    await syncProvider(buildProvider('USER'));

    expect(await findProviderScopes()).toEqual(['USER']);
  }, 60000);

  it('rejects an unknown scope on create', async () => {
    const { errors } = await syncProvider(
      buildProvider('WORKSPACE_MEMBER' as never),
      { expectToFail: true },
    );

    expect(JSON.stringify(errors)).toContain(
      'Connection provider scope \\"WORKSPACE_MEMBER\\" is invalid',
    );
    expect(await findProviderScopes()).toEqual([]);
  }, 60000);

  it('rejects an unknown scope on update and keeps the stored one', async () => {
    await syncProvider(buildProvider('USER'));

    const { errors } = await syncProvider(
      buildProvider('WORKSPACE_MEMBER' as never),
      { expectToFail: true },
    );

    expect(JSON.stringify(errors)).toContain(
      'Connection provider scope \\"WORKSPACE_MEMBER\\" is invalid',
    );
    expect(await findProviderScopes()).toEqual(['USER']);
  }, 60000);
});
