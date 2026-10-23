import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { type ConnectionProviderManifest } from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_PROVIDER_ID = uuidv4();

const buildProvider = ({
  scope,
  universalIdentifier = TEST_PROVIDER_ID,
}: {
  scope?: ConnectionProviderManifest['scope'];
  universalIdentifier?: string;
} = {}): ConnectionProviderManifest => ({
  universalIdentifier,
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

const insertConnectedAccount = async (): Promise<string> => {
  const [provider] = await findConnectionProvidersByApplication(TEST_APP_ID);
  const id = uuidv4();

  await globalThis.testDataSource.query(
    `INSERT INTO core."connectedAccount"
       (id, handle, provider, scope, "workspaceId", "userWorkspaceId",
        "applicationId", "connectionProviderId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      'linear@example.com',
      ConnectedAccountProvider.APP,
      provider.scope,
      SEED_APPLE_WORKSPACE_ID,
      USER_WORKSPACE_DATA_SEED_IDS.JANE,
      provider.applicationId,
      provider.id,
    ],
  );

  return id;
};

const countConnectedAccounts = async (id: string): Promise<number> => {
  const [{ count }] = await globalThis.testDataSource.query(
    'SELECT count(*)::int AS count FROM core."connectedAccount" WHERE id = $1',
    [id],
  );

  return count;
};

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
    await syncProvider(buildProvider({ scope: 'USER' }));

    expect(await findProviderScopes()).toEqual(['USER']);
  }, 60000);

  it('refuses a scope change on a later sync and keeps the stored one', async () => {
    await syncProvider(buildProvider({ scope: 'WORKSPACE' }));

    const { errors } = await syncProvider(buildProvider({ scope: 'USER' }), {
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'Connection provider scope cannot be changed after creation',
    );
    expect(await findProviderScopes()).toEqual(['WORKSPACE']);
  }, 60000);

  it('deletes the connections of a provider replaced by one with a new identifier', async () => {
    await syncProvider(buildProvider({ scope: 'WORKSPACE' }));
    const connectedAccountId = await insertConnectedAccount();

    await syncProvider(
      buildProvider({ scope: 'USER', universalIdentifier: uuidv4() }),
    );

    expect(await findProviderScopes()).toEqual(['USER']);
    expect(await countConnectedAccounts(connectedAccountId)).toBe(0);
  }, 60000);

  it('rejects an unknown scope on create', async () => {
    const { errors } = await syncProvider(
      buildProvider({ scope: 'WORKSPACE_MEMBER' as never }),
      { expectToFail: true },
    );

    expect(JSON.stringify(errors)).toContain(
      'Connection provider scope \\"WORKSPACE_MEMBER\\" is invalid',
    );
    expect(await findProviderScopes()).toEqual([]);
  }, 60000);
});
