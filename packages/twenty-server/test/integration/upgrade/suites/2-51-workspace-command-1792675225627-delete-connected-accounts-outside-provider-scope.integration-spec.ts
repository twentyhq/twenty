import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type DeleteConnectedAccountsOutsideProviderScopeCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792675225627-delete-connected-accounts-outside-provider-scope.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const APPLICATION_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-51 workspace command - delete connected accounts outside provider scope (integration)', () => {
  let command: DeleteConnectedAccountsOutsideProviderScopeCommand;
  let applicationId: string;
  let connectionProviderId: string;

  const insertConnectedAccount = async ({
    provider,
    scope,
    isAppConnection,
  }: {
    provider: ConnectedAccountProvider;
    scope: 'USER' | 'WORKSPACE';
    isAppConnection: boolean;
  }): Promise<string> => {
    const id = v4();

    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        `${id}@provider-scope.test`,
        provider,
        scope,
        SEED_APPLE_WORKSPACE_ID,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        isAppConnection ? applicationId : null,
        isAppConnection ? connectionProviderId : null,
      ],
    );

    return id;
  };

  const findRemainingIds = async (ids: string[]): Promise<string[]> => {
    const rows = await globalThis.testDataSource.query<{ id: string }[]>(
      'SELECT id FROM core."connectedAccount" WHERE id = ANY($1)',
      [ids],
    );

    return rows.map(({ id }) => id).sort();
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<DeleteConnectedAccountsOutsideProviderScopeCommand>(
        'DeleteConnectedAccountsOutsideProviderScopeCommand',
      );

    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'Provider scope cleanup',
      description: 'Connected accounts outside their provider scope',
      sourcePath: 'provider-scope-cleanup',
    });

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: v4(),
        overrides: {
          connectionProviders: [
            {
              universalIdentifier: PROVIDER_IDENTIFIER,
              name: 'workspace-provider',
              displayName: 'Workspace provider',
              type: 'oauth',
              scope: 'WORKSPACE',
              oauth: {
                authorizationEndpoint:
                  'https://provider-scope.example.com/authorize',
                tokenEndpoint: 'https://provider-scope.example.com/token',
                scopes: ['read'],
                clientIdVariable: 'CLIENT_ID',
                clientSecretVariable: 'CLIENT_SECRET',
              },
            },
          ],
        },
      }),
    });

    expect(errors).toBeUndefined();
    jest.useRealTimers();

    const [provider] = await findConnectionProvidersByApplication(
      APPLICATION_IDENTIFIER,
    );

    applicationId = provider.applicationId;
    connectionProviderId = provider.id;
  }, 120000);

  afterEach(async () => {
    await globalThis.testDataSource.query(
      'DELETE FROM core."connectedAccount" WHERE handle LIKE $1',
      ['%@provider-scope.test'],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
    });
  });

  it('deletes only app connections whose scope differs from their provider scope', async () => {
    const googleAccountId = await insertConnectedAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      scope: 'USER',
      isAppConnection: false,
    });
    const microsoftAccountId = await insertConnectedAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      scope: 'USER',
      isAppConnection: false,
    });
    const sharedAppAccountId = await insertConnectedAccount({
      provider: ConnectedAccountProvider.APP,
      scope: 'WORKSPACE',
      isAppConnection: true,
    });
    const personalAppAccountId = await insertConnectedAccount({
      provider: ConnectedAccountProvider.APP,
      scope: 'USER',
      isAppConnection: true,
    });
    const allIds = [
      googleAccountId,
      microsoftAccountId,
      sharedAppAccountId,
      personalAppAccountId,
    ];

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findRemainingIds(allIds)).toEqual(
      [googleAccountId, microsoftAccountId, sharedAppAccountId].sort(),
    );
  });

  it('deletes nothing on a dry run', async () => {
    const personalAppAccountId = await insertConnectedAccount({
      provider: ConnectedAccountProvider.APP,
      scope: 'USER',
      isAppConnection: true,
    });

    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(await findRemainingIds([personalAppAccountId])).toEqual([
      personalAppAccountId,
    ]);
  });
});
