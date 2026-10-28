import {
  createMcpServer,
  deleteMcpServer,
  syncMcpServerTools,
  updateMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-test.util';
import {
  type FakeMcpServer,
  startFakeMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-fake-server.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const UNREACHABLE_URL = 'http://127.0.0.1:1/mcp';

describe('mcpServer tool sync (e2e)', () => {
  let fakeMcpServer: FakeMcpServer;
  const createdMcpServerIds: string[] = [];

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
      value: true,
      expectToFail: false,
    });
    await updateConfigVariable({
      input: {
        key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS',
        value: ['127.0.0.1'],
      },
    });
    fakeMcpServer = await startFakeMcpServer();
  });

  afterAll(async () => {
    await fakeMcpServer.close();
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    });
  });

  afterEach(async () => {
    for (const id of createdMcpServerIds.splice(0)) {
      const response = await deleteMcpServer(id);

      expect(response.body.errors).toBeUndefined();
    }
  });

  const createAndTrack = async ({
    url,
    connectionProviderId,
  }: {
    url: string;
    connectionProviderId?: string;
  }) => {
    const response = await createMcpServer({
      name: `fake_${uuidv4().slice(0, 8)}`,
      label: 'Fake',
      url,
      connectionProviderId,
    });
    const created = response.body.data?.createMcpServer;

    if (isDefined(created?.id)) {
      createdMcpServerIds.push(created.id);
    }

    expect(response.body.errors).toBeUndefined();

    return created;
  };

  it('caches the sanitized tool list when the server is created', async () => {
    const created = await createAndTrack({ url: fakeMcpServer.url });

    expect(created.toolsSyncError).toBeNull();
    expect(created.toolsSyncedAt).not.toBeNull();
    expect(created.tools).toEqual([
      {
        name: 'search_docs',
        description: 'Search the documentation',
        inputSchema: expect.objectContaining({ type: 'object' }),
        annotations: { readOnlyHint: true },
      },
    ]);
    expect(new Set(fakeMcpServer.receivedAuthorizationHeaders)).toEqual(
      new Set([undefined]),
    );
  });

  it('authenticates with the shared account of the linked provider', async () => {
    const accessToken = 'mcp-access-token';
    const workspaceId = SEED_APPLE_WORKSPACE_ID;
    const { workspaceCustomFlatApplication } =
      await getAppProviderByClassName<ApplicationService>(
        'ApplicationService',
      ).findWorkspaceTwentyStandardAndCustomApplicationOrThrow({ workspaceId });
    const flatEntityMapsCacheService =
      getAppProviderByClassName<WorkspaceManyOrAllFlatEntityMapsCacheService>(
        'WorkspaceManyOrAllFlatEntityMapsCacheService',
      );
    const connectionProviderRepository =
      getCoreRepository<ConnectionProviderEntity>(ConnectionProviderEntity);
    const connectedAccountRepository =
      getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);

    const connectionProvider = await connectionProviderRepository.save({
      universalIdentifier: uuidv4(),
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
      name: `mcp_${uuidv4().slice(0, 8)}`,
      displayName: 'Fake MCP provider',
      type: 'oauth',
      scope: 'WORKSPACE',
      oauthConfig: null,
    });

    await flatEntityMapsCacheService.invalidateFlatEntityMaps({
      workspaceId,
      flatMapsKeys: ['flatConnectionProviderMaps'],
    });

    const connectedAccount = await connectedAccountRepository.save({
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
      connectionProviderId: connectionProvider.id,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      handle: 'shared@fake-mcp.test',
      provider: ConnectedAccountProvider.APP,
      scope: 'WORKSPACE',
      accessToken:
        getAppProviderByClassName<ConnectedAccountTokenEncryptionService>(
          'ConnectedAccountTokenEncryptionService',
        ).encrypt({
          plaintext: plaintextStringSchema.parse(accessToken),
          workspaceId,
        }),
    });

    try {
      const created = await createAndTrack({
        url: fakeMcpServer.url,
        connectionProviderId: connectionProvider.id,
      });

      expect(created.toolsSyncError).toBeNull();
      expect(created.tools).toHaveLength(1);
      expect(fakeMcpServer.receivedAuthorizationHeaders).toContainEqual(
        `Bearer ${accessToken}`,
      );
    } finally {
      for (const id of createdMcpServerIds.splice(0)) {
        await deleteMcpServer(id);
      }
      await connectedAccountRepository.delete({ id: connectedAccount.id });
      await connectionProviderRepository.delete({ id: connectionProvider.id });
      await flatEntityMapsCacheService.invalidateFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatConnectionProviderMaps', 'flatMcpServerMaps'],
      });
    }
  });

  it('records the failure and keeps the server when it is unreachable', async () => {
    const created = await createAndTrack({ url: UNREACHABLE_URL });

    expect(created.tools).toEqual([]);
    expect(created.toolsSyncedAt).toBeNull();
    expect(created.toolsSyncError).toEqual(expect.any(String));
  });

  it('re-syncs when the url changes and keeps the last good list on a failed re-sync', async () => {
    const created = await createAndTrack({ url: UNREACHABLE_URL });

    const updated = await updateMcpServer({
      id: created.id,
      update: { url: fakeMcpServer.url },
    });

    expect(updated.body.data.updateMcpServer.tools).toHaveLength(1);
    expect(updated.body.data.updateMcpServer.toolsSyncError).toBeNull();

    await fakeMcpServer.close();

    try {
      const synced = await syncMcpServerTools(created.id);

      expect(synced.body.data.syncMcpServerTools.toolsSyncError).toEqual(
        expect.any(String),
      );
      expect(synced.body.data.syncMcpServerTools.tools).toHaveLength(1);
    } finally {
      fakeMcpServer = await startFakeMcpServer();
    }
  });
});
