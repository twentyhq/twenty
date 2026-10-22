import { gql } from 'graphql-tag';
import {
  FAKE_MCP_TOOL_DESCRIPTION,
  FAKE_MCP_TOOL_NAME,
  type FakeMcpServer,
  startFakeMcpServer,
} from 'test/integration/metadata/suites/utils/fake-mcp-server.util';
import {
  createMcpServer,
  deleteMcpServer,
  syncMcpServerTools,
  updateMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-test.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const FAKE_MCP_SERVER_PORT = 4318;

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

const allowLoopbackOutboundRequests = async () => {
  const response = await makeAdminPanelApiRequest({
    query: CREATE_CONFIG_VARIABLE_MUTATION,
    variables: {
      key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS',
      value: ['127.0.0.1'],
    },
  });

  expect(response.body.errors).toBeUndefined();
};

const restoreOutboundRequestPolicy = () =>
  makeAdminPanelApiRequest({
    query: DELETE_CONFIG_VARIABLE_MUTATION,
    variables: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS' },
  }).catch(() => undefined);

describe('MCP server tool sync (e2e)', () => {
  let fakeMcpServer: FakeMcpServer;
  const createdMcpServerIds: string[] = [];

  beforeAll(async () => {
    jest.useRealTimers();

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
      value: true,
      expectToFail: false,
    });

    fakeMcpServer = await startFakeMcpServer(FAKE_MCP_SERVER_PORT);
  });

  afterAll(async () => {
    await fakeMcpServer.close();
    await restoreOutboundRequestPolicy();
  });

  afterEach(async () => {
    for (const id of createdMcpServerIds.splice(0)) {
      await deleteMcpServer(id).catch(() => undefined);
    }
  });

  const createAndTrack = async (
    input: {
      name?: string;
      url?: string;
      authorizationHeaderValue?: string;
    } = {},
  ) => {
    const response = await createMcpServer({
      name: 'fake',
      label: 'Fake',
      url: fakeMcpServer.url,
      ...input,
    });

    if (response.body.data?.createMcpServer?.id) {
      createdMcpServerIds.push(response.body.data.createMcpServer.id);
    }

    return response;
  };

  it('records a sync error instead of failing when the server is blocked or unreachable', async () => {
    const blockedResponse = await createAndTrack();

    expect(blockedResponse.body.errors).toBeUndefined();
    expect(blockedResponse.body.data.createMcpServer).toMatchObject({
      tools: [],
      toolsSyncedAt: null,
    });
    expect(blockedResponse.body.data.createMcpServer.toolsSyncError).toEqual(
      expect.any(String),
    );

    await allowLoopbackOutboundRequests();

    const unreachableResponse = await createAndTrack({
      name: 'unreachable',
      url: `http://127.0.0.1:${FAKE_MCP_SERVER_PORT + 1}/mcp`,
    });

    expect(unreachableResponse.body.errors).toBeUndefined();
    expect(unreachableResponse.body.data.createMcpServer).toMatchObject({
      tools: [],
      toolsSyncedAt: null,
      toolsSyncError: expect.any(String),
    });
  });

  it('caches the remote tool list on create and sends the authorization header', async () => {
    await allowLoopbackOutboundRequests();

    const response = await createAndTrack({
      authorizationHeaderValue: 'Bearer fake-token',
    });

    expect(response.body.errors).toBeUndefined();

    const mcpServer = response.body.data.createMcpServer;

    expect(mcpServer.toolsSyncError).toBeNull();
    expect(mcpServer.toolsSyncedAt).toEqual(expect.any(String));
    expect(mcpServer.tools).toEqual([
      {
        name: FAKE_MCP_TOOL_NAME,
        description: FAKE_MCP_TOOL_DESCRIPTION,
        inputSchema: expect.objectContaining({ type: 'object' }),
        annotations: expect.objectContaining({ readOnlyHint: true }),
      },
    ]);
    expect(fakeMcpServer.receivedAuthorizationHeaders).toContain(
      'Bearer fake-token',
    );
    expect(JSON.stringify(response.body)).not.toContain('fake-token');
  });

  it('re-syncs when the url changes and on demand', async () => {
    await allowLoopbackOutboundRequests();

    const created = (
      await createAndTrack({
        url: `http://127.0.0.1:${FAKE_MCP_SERVER_PORT + 1}/mcp`,
      })
    ).body.data.createMcpServer;

    expect(created.tools).toEqual([]);
    expect(created.toolsSyncError).toEqual(expect.any(String));

    const updateResponse = await updateMcpServer(created.id, {
      url: fakeMcpServer.url,
    });

    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateMcpServer).toMatchObject({
      toolsSyncError: null,
      tools: [expect.objectContaining({ name: FAKE_MCP_TOOL_NAME })],
    });

    const requestCountBeforeSync =
      fakeMcpServer.receivedAuthorizationHeaders.length;

    const labelOnlyUpdate = await updateMcpServer(created.id, {
      label: 'Still fake',
    });

    expect(labelOnlyUpdate.body.errors).toBeUndefined();
    expect(fakeMcpServer.receivedAuthorizationHeaders).toHaveLength(
      requestCountBeforeSync,
    );

    const syncResponse = await syncMcpServerTools(created.id);

    expect(syncResponse.body.errors).toBeUndefined();
    expect(syncResponse.body.data.syncMcpServerTools.tools).toHaveLength(1);
    expect(fakeMcpServer.receivedAuthorizationHeaders.length).toBeGreaterThan(
      requestCountBeforeSync,
    );
  });

  it('fails to sync an unknown server', async () => {
    const response = await syncMcpServerTools(uuidv4());

    expect(response.body.errors).toBeDefined();
  });
});
