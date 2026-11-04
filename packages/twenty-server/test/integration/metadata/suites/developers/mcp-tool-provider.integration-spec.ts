import { getToolIndex } from 'test/integration/graphql/suites/application-role-intersection/utils/get-tool-index.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  createMcpServer,
  deleteMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-test.util';
import {
  type FakeMcpServer,
  startFakeMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-fake-server.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import gql from 'graphql-tag';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const GET_TOOL_INPUT_SCHEMA_QUERY = gql`
  query GetToolInputSchema($toolName: String!) {
    getToolInputSchema(toolName: $toolName)
  }
`;

describe('MCP tools in the tool registry (e2e)', () => {
  let fakeMcpServer: FakeMcpServer;
  let mcpServerId: string;
  let mcpServerName: string;

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
    mcpServerName = `fake_${uuidv4().slice(0, 8)}`;

    const response = await createMcpServer({
      name: mcpServerName,
      label: 'Fake docs',
      url: fakeMcpServer.url,
    });

    expect(response.body.errors).toBeUndefined();
    mcpServerId = response.body.data.createMcpServer.id;
  });

  afterAll(async () => {
    await deleteMcpServer(mcpServerId);
    await fakeMcpServer.close();
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    });
  });

  it('lists the cached tools under the MCP category', async () => {
    const { data } = await getToolIndex({});

    expect(data.getToolIndex).toContainEqual({
      name: `mcp_${mcpServerName}_search_docs`,
      category: 'MCP',
    });
  });

  it('serves the cached input schema on demand', async () => {
    const response = await makeMetadataApiRequest({
      query: GET_TOOL_INPUT_SCHEMA_QUERY,
      variables: { toolName: `mcp_${mcpServerName}_search_docs` },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getToolInputSchema).toEqual(
      expect.objectContaining({
        type: 'object',
        properties: { query: { type: 'string' } },
      }),
    );
  });

  it('runs the tool on the remote server and returns its content', async () => {
    const toolRegistryService = getAppProviderByClassName<ToolRegistryService>(
      'ToolRegistryService',
    );

    const output = await toolRegistryService.resolveAndExecute(
      `mcp_${mcpServerName}_search_docs`,
      { query: 'invoices' },
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        userId: USER_DATA_SEED_IDS.JANE,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      },
    );

    expect(output).toEqual({
      success: true,
      message: `MCP tool mcp_${mcpServerName}_search_docs executed`,
      result: { content: [{ type: 'text', text: 'results for invoices' }] },
    });
  });
});
