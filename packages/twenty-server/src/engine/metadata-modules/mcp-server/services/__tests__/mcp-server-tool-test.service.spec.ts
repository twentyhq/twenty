import { Test } from '@nestjs/testing';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { McpServerToolCallService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-call.service';
import { McpServerToolTestService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-test.service';

const WORKSPACE_ID = 'workspace-id';

const MCP_SERVER = {
  id: 'mcp-server-id',
  universalIdentifier: 'mcp-server-universal-id',
  workspaceId: WORKSPACE_ID,
  applicationId: 'application-id',
  label: 'Docs',
  url: 'https://docs.example.com/mcp',
  connectionProviderId: null,
  isActive: true,
  tools: [
    {
      name: 'search_docs',
      description: null,
      inputSchema: { type: 'object' },
      annotations: null,
    },
  ],
};

const setup = async (mcpServer: typeof MCP_SERVER = MCP_SERVER) => {
  const callTool = jest.fn().mockResolvedValue({
    output: {
      success: true,
      message: 'MCP tool search_docs executed',
      result: { total: 2 },
    },
    isToolUnknownToServer: false,
  });

  const module = await Test.createTestingModule({
    providers: [
      McpServerToolTestService,
      { provide: McpServerToolCallService, useValue: { callTool } },
      {
        provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
        useValue: {
          getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
            flatMcpServerMaps: {
              byUniversalIdentifier: {
                [mcpServer.universalIdentifier]: mcpServer,
              },
              universalIdentifierById: {
                [mcpServer.id]: mcpServer.universalIdentifier,
              },
            },
          }),
        },
      },
    ],
  }).compile();

  return { service: module.get(McpServerToolTestService), callTool };
};

const testTool = (
  service: McpServerToolTestService,
  overrides: Partial<Parameters<McpServerToolTestService['testTool']>[0]> = {},
) =>
  service.testTool({
    mcpServerId: MCP_SERVER.id,
    toolName: 'search_docs',
    toolArguments: { query: 'invoices' },
    workspaceId: WORKSPACE_ID,
    userWorkspaceId: 'user-workspace-id',
    ...overrides,
  });

describe('McpServerToolTestService', () => {
  it('calls the tool as the requesting user and returns its result', async () => {
    const { service, callTool } = await setup();

    await expect(testTool(service)).resolves.toEqual({
      success: true,
      result: { total: 2 },
    });
    expect(callTool).toHaveBeenCalledWith({
      mcpServer: MCP_SERVER,
      toolName: 'search_docs',
      toolArguments: { query: 'invoices' },
      userWorkspaceId: 'user-workspace-id',
    });
  });

  it('drops the null arguments the editor seeds for untouched fields', async () => {
    const { service, callTool } = await setup();

    await testTool(service, {
      toolArguments: {
        query: 'invoices',
        limit: null,
        note: '',
        filter: { status: null },
      },
    });

    expect(callTool).toHaveBeenCalledWith(
      expect.objectContaining({
        toolArguments: { query: 'invoices', note: '' },
      }),
    );
  });

  it('calls a tool without arguments when none are given', async () => {
    const { service, callTool } = await setup();

    await testTool(service, { toolArguments: undefined });

    expect(callTool).toHaveBeenCalledWith(
      expect.objectContaining({ toolArguments: {} }),
    );
  });

  it('returns the tool error instead of throwing when the call fails', async () => {
    const { service, callTool } = await setup();

    callTool.mockResolvedValue({
      output: {
        success: false,
        message: 'MCP tool search_docs failed',
        error: 'Query is required',
      },
      isToolUnknownToServer: false,
    });

    await expect(testTool(service)).resolves.toEqual({
      success: false,
      error: 'Query is required',
    });
  });

  it('rejects an unknown server', async () => {
    const { service, callTool } = await setup();

    await expect(
      testTool(service, { mcpServerId: 'other-mcp-server-id' }),
    ).rejects.toMatchObject({
      code: McpServerExceptionCode.MCP_SERVER_NOT_FOUND,
    });
    expect(callTool).not.toHaveBeenCalled();
  });

  it('rejects an inactive server without calling it', async () => {
    const { service, callTool } = await setup({
      ...MCP_SERVER,
      isActive: false,
    });

    await expect(testTool(service)).rejects.toBeInstanceOf(McpServerException);
    expect(callTool).not.toHaveBeenCalled();
  });

  it('rejects a tool the server no longer offers without calling it', async () => {
    const { service, callTool } = await setup();

    await expect(
      testTool(service, { toolName: 'delete_docs' }),
    ).rejects.toMatchObject({
      code: McpServerExceptionCode.INVALID_MCP_SERVER_INPUT,
    });
    expect(callTool).not.toHaveBeenCalled();
  });
});
