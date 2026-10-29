import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateMcpServer } from 'test/integration/metadata/suites/utils/mcp-server-test.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
  type ConnectionProviderManifest,
  type McpServerManifest,
} from 'twenty-shared/application';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const CONNECTION_PROVIDER_ID = uuidv4();
const MCP_SERVER_ID = uuidv4();

const CONNECTION_PROVIDER: ConnectionProviderManifest = {
  universalIdentifier: CONNECTION_PROVIDER_ID,
  name: 'github',
  displayName: 'GitHub',
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    scopes: ['repo'],
    clientIdVariable: 'GITHUB_CLIENT_ID',
    clientSecretVariable: 'GITHUB_CLIENT_SECRET',
  },
};

const buildMcpServer = (
  overrides: Partial<McpServerManifest> = {},
): McpServerManifest => ({
  universalIdentifier: MCP_SERVER_ID,
  name: 'github',
  label: 'GitHub',
  url: 'https://api.githubcopilot.com/mcp/',
  connectionProvider: { universalIdentifier: CONNECTION_PROVIDER_ID },
  ...overrides,
});

const syncMcpServers = ({
  mcpServers,
  expectToFail = false,
}: {
  mcpServers: McpServerManifest[];
  expectToFail?: boolean;
}) =>
  syncApplication({
    manifest: buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        connectionProviders: [CONNECTION_PROVIDER],
        mcpServers,
      },
    }),
    expectToFail,
  });

const findMcpServers = async (): Promise<
  {
    id: string;
    name: string;
    label: string;
    url: string;
    isActive: boolean;
    connectionProviderUniversalIdentifier: string | null;
  }[]
> =>
  globalThis.testDataSource.query(
    `SELECT ms.id, ms.name, ms.label, ms.url, ms."isActive",
            cp."universalIdentifier" AS "connectionProviderUniversalIdentifier"
       FROM core."mcpServer" ms
       JOIN core."application" app ON app.id = ms."applicationId"
       LEFT JOIN core."connectionProvider" cp ON cp.id = ms."connectionProviderId"
      WHERE app."universalIdentifier" = $1
      ORDER BY ms.name`,
    [TEST_APP_ID],
  );

describe('MCP server manifest sync', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing MCP servers',
      sourcePath: 'test-mcp-server-sync',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('stores an MCP server linked to its connection provider', async () => {
    await syncMcpServers({ mcpServers: [buildMcpServer()] });

    expect(await findMcpServers()).toEqual([
      {
        id: expect.any(String),
        name: 'github',
        label: 'GitHub',
        url: 'https://api.githubcopilot.com/mcp/',
        isActive: true,
        connectionProviderUniversalIdentifier: CONNECTION_PROVIDER_ID,
      },
    ]);
  }, 60000);

  it('stores a public MCP server without connection provider', async () => {
    await syncMcpServers({
      mcpServers: [
        buildMcpServer({
          name: 'docs',
          label: 'Docs',
          url: 'https://docs.example.com/mcp',
          connectionProvider: undefined,
        }),
      ],
    });

    expect(await findMcpServers()).toEqual([
      expect.objectContaining({
        name: 'docs',
        connectionProviderUniversalIdentifier: null,
      }),
    ]);
  }, 60000);

  it('refuses a connection provider that is not in the application', async () => {
    const { errors } = await syncMcpServers({
      mcpServers: [
        buildMcpServer({
          connectionProvider: { universalIdentifier: uuidv4() },
        }),
      ],
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain('Connection provider not found');
    expect(await findMcpServers()).toEqual([]);
  }, 60000);

  it('refuses a name that is not a snake_case tool prefix', async () => {
    const { errors } = await syncMcpServers({
      mcpServers: [buildMcpServer({ name: 'Git-Hub' })],
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain('Invalid MCP server name');
  }, 60000);

  it('updates the label of an MCP server on re-sync', async () => {
    await syncMcpServers({ mcpServers: [buildMcpServer()] });
    await syncMcpServers({
      mcpServers: [buildMcpServer({ label: 'GitHub Enterprise' })],
    });

    expect(await findMcpServers()).toEqual([
      expect.objectContaining({ label: 'GitHub Enterprise' }),
    ]);
  }, 60000);

  it('deletes an MCP server the manifest no longer declares', async () => {
    await syncMcpServers({ mcpServers: [buildMcpServer()] });
    await syncMcpServers({ mcpServers: [] });

    expect(await findMcpServers()).toEqual([]);
  }, 60000);

  it('keeps an MCP server the workspace deactivated on re-sync', async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
      value: true,
      expectToFail: false,
    });
    await syncMcpServers({ mcpServers: [buildMcpServer()] });

    const [mcpServer] = await findMcpServers();
    const response = await updateMcpServer({
      id: mcpServer.id,
      update: { isActive: false },
    });

    expect(response.body.errors).toBeUndefined();

    await syncMcpServers({
      mcpServers: [buildMcpServer({ label: 'GitHub Enterprise' })],
    });

    expect(await findMcpServers()).toEqual([
      expect.objectContaining({
        label: 'GitHub Enterprise',
        isActive: false,
      }),
    ]);
  }, 60000);
});
