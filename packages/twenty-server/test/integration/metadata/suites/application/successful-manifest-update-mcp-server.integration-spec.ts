import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  FAKE_MCP_TOOL_NAME,
  type FakeMcpServer,
  startFakeMcpServer,
} from 'test/integration/metadata/suites/utils/fake-mcp-server.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_MCP_SERVER_ID = uuidv4();
const FAKE_MCP_SERVER_PORT = 4319;

type McpServerRow = {
  universalIdentifier: string;
  name: string;
  label: string;
  url: string;
  isEnabled: boolean;
  tools: McpServerTool[];
  toolsSyncError: string | null;
};

const CREATE_CONFIG_VARIABLE_MUTATION = gql`
  mutation CreateDatabaseConfigVariable($key: String!, $value: JSON!) {
    createDatabaseConfigVariable(key: $key, value: $value)
  }
`;

const DELETE_CONFIG_VARIABLE_MUTATION = gql`
  mutation DeleteDatabaseConfigVariable($key: String!) {
    deleteDatabaseConfigVariable(key: $key)
  }
`;

const findMcpServersByApplication = (
  applicationUniversalIdentifier: string,
): Promise<McpServerRow[]> =>
  globalThis.testDataSource.query(
    `SELECT ms."universalIdentifier", ms.name, ms.label, ms.url,
            ms."isEnabled", ms.tools, ms."toolsSyncError"
       FROM core."mcpServer" ms
       JOIN core."application" app ON app.id = ms."applicationId"
      WHERE app."universalIdentifier" = $1 AND ms."deletedAt" IS NULL
   ORDER BY ms.name`,
    [applicationUniversalIdentifier],
  );

const buildManifest = (overrides?: Partial<Pick<Manifest, 'mcpServers'>>) =>
  buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID, overrides });

describe('Manifest update - MCP servers', () => {
  let fakeMcpServer: FakeMcpServer;

  beforeAll(async () => {
    jest.useRealTimers();
    fakeMcpServer = await startFakeMcpServer(FAKE_MCP_SERVER_PORT);

    await makeAdminPanelApiRequest({
      query: CREATE_CONFIG_VARIABLE_MUTATION,
      variables: {
        key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS',
        value: ['127.0.0.1'],
      },
    });
  });

  afterAll(async () => {
    await fakeMcpServer.close();
    await makeAdminPanelApiRequest({
      query: DELETE_CONFIG_VARIABLE_MUTATION,
      variables: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS' },
    }).catch(() => undefined);
  });

  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing MCP server manifest updates',
      sourcePath: 'test-manifest-update-mcp-server',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('creates the declared server and caches its tools on sync', async () => {
    await syncApplication({
      manifest: buildManifest({ mcpServers: [] }),
      expectToFail: false,
    });

    expect(await findMcpServersByApplication(TEST_APP_ID)).toHaveLength(0);

    await syncApplication({
      manifest: buildManifest({
        mcpServers: [
          {
            universalIdentifier: TEST_MCP_SERVER_ID,
            name: 'docs',
            label: 'Docs',
            url: fakeMcpServer.url,
          },
        ],
      }),
      expectToFail: false,
    });

    const mcpServers = await findMcpServersByApplication(TEST_APP_ID);

    expect(mcpServers).toHaveLength(1);
    expect(mcpServers[0]).toMatchObject({
      universalIdentifier: TEST_MCP_SERVER_ID,
      name: 'docs',
      label: 'Docs',
      url: fakeMcpServer.url,
      isEnabled: true,
      toolsSyncError: null,
    });
    expect(mcpServers[0].tools.map(({ name }) => name)).toEqual([
      FAKE_MCP_TOOL_NAME,
    ]);
  }, 60000);

  it('updates the server and re-syncs its tools when the manifest changes', async () => {
    await syncApplication({
      manifest: buildManifest({
        mcpServers: [
          {
            universalIdentifier: TEST_MCP_SERVER_ID,
            name: 'docs',
            label: 'Docs',
            url: `http://127.0.0.1:${FAKE_MCP_SERVER_PORT + 1}/mcp`,
          },
        ],
      }),
      expectToFail: false,
    });

    const [unreachableServer] = await findMcpServersByApplication(TEST_APP_ID);

    expect(unreachableServer.tools).toEqual([]);
    expect(unreachableServer.toolsSyncError).toEqual(expect.any(String));

    await syncApplication({
      manifest: buildManifest({
        mcpServers: [
          {
            universalIdentifier: TEST_MCP_SERVER_ID,
            name: 'docs',
            label: 'Docs (renamed)',
            url: fakeMcpServer.url,
          },
        ],
      }),
      expectToFail: false,
    });

    const [reachableServer] = await findMcpServersByApplication(TEST_APP_ID);

    expect(reachableServer).toMatchObject({
      label: 'Docs (renamed)',
      url: fakeMcpServer.url,
      toolsSyncError: null,
    });
    expect(reachableServer.tools).toHaveLength(1);
  }, 60000);

  it('deletes the server when it leaves the manifest', async () => {
    await syncApplication({
      manifest: buildManifest({
        mcpServers: [
          {
            universalIdentifier: TEST_MCP_SERVER_ID,
            name: 'docs',
            label: 'Docs',
            url: fakeMcpServer.url,
          },
        ],
      }),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest({ mcpServers: [] }),
      expectToFail: false,
    });

    expect(await findMcpServersByApplication(TEST_APP_ID)).toHaveLength(0);
  }, 60000);
});
