import { getToolIndex } from 'test/integration/graphql/suites/application-role-intersection/utils/get-tool-index.util';
import { getToolInputSchemaQueryFactory } from 'test/integration/metadata/suites/utils/get-tool-input-schema-query-factory.util';
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
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const TOOL_CONTEXT = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  userId: USER_DATA_SEED_IDS.JANE,
  userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
};

const getToolRegistryService = () =>
  getAppProviderByClassName<ToolRegistryService>('ToolRegistryService');

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
    fakeMcpServer = await startFakeMcpServer({ isDeletePageOffered: true });
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
      name: `mcp__${mcpServerName}__search_docs`,
      category: 'MCP',
    });
  });

  it('serves the cached input schema on demand', async () => {
    const response = await makeMetadataApiRequest(
      getToolInputSchemaQueryFactory({
        toolName: `mcp__${mcpServerName}__search_docs`,
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getToolInputSchema).toEqual(
      expect.objectContaining({
        type: 'object',
        properties: { query: { type: 'string' } },
      }),
    );
  });

  it('runs the tool on the remote server and returns its content', async () => {
    const output = await getToolRegistryService().resolveAndExecute(
      `mcp__${mcpServerName}__search_docs`,
      { query: 'invoices' },
      TOOL_CONTEXT,
    );

    expect(output).toEqual({
      success: true,
      message: `MCP tool mcp__${mcpServerName}__search_docs executed`,
      result: { content: [{ type: 'text', text: 'results for invoices' }] },
    });
  });

  it('only runs a destructive tool once the user approved it', async () => {
    const toolName = `mcp__${mcpServerName}__delete_page`;

    const unapprovedOutput = await getToolRegistryService().resolveAndExecute(
      toolName,
      { pageId: 'page-1' },
      TOOL_CONTEXT,
    );

    expect(unapprovedOutput).toEqual({
      success: false,
      message: `Tool ${toolName} requires approval`,
      error: expect.stringContaining('propose_tool_call'),
    });

    const approvedOutput = await getToolRegistryService().resolveAndExecute(
      toolName,
      { pageId: 'page-1' },
      { ...TOOL_CONTEXT, approvedToolName: toolName },
    );

    expect(approvedOutput).toEqual({
      success: true,
      message: `MCP tool ${toolName} executed`,
      result: { content: [{ type: 'text', text: 'deleted page-1' }] },
    });
  });

  it('fills the tool list of a server that was never synced', async () => {
    await getCoreRepository<McpServerEntity>(McpServerEntity).update(
      { id: mcpServerId },
      { tools: [], toolsSyncedAt: null, toolsSyncError: null },
    );
    await getAppProviderByClassName<WorkspaceManyOrAllFlatEntityMapsCacheService>(
      'WorkspaceManyOrAllFlatEntityMapsCacheService',
    ).invalidateFlatEntityMaps({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      flatMapsKeys: ['flatMcpServerMaps'],
    });

    const { data } = await getToolIndex({});

    expect(data.getToolIndex).toContainEqual({
      name: `mcp__${mcpServerName}__search_docs`,
      category: 'MCP',
    });
  });

  it('refreshes the cached tools when the server no longer offers one', async () => {
    const toolName = `mcp__${mcpServerName}__search_docs`;

    fakeMcpServer.stopOfferingSearchDocs();

    const output = await getToolRegistryService().resolveAndExecute(
      toolName,
      { query: 'invoices' },
      TOOL_CONTEXT,
    );

    expect(output).toEqual({
      success: false,
      message: expect.stringContaining('its tool list was refreshed'),
      error: expect.stringContaining('search_docs not found'),
    });

    const { data } = await getToolIndex({});

    expect(data.getToolIndex).not.toContainEqual({
      name: toolName,
      category: 'MCP',
    });
  });
});
