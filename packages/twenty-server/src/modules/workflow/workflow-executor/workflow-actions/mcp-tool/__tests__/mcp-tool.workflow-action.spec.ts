import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { type McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { type WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { McpToolWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/mcp-tool.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const WORKSPACE_ID = 'workspace-id';
const MCP_SERVER_ID = 'mcp-server-id';

const mcpServer = {
  id: MCP_SERVER_ID,
  universalIdentifier: 'mcp-server-universal-id',
  workspaceId: WORKSPACE_ID,
  applicationId: 'application-id',
  label: 'Docs',
  url: 'https://docs.example.com/mcp',
  connectionProviderId: null,
  isActive: true,
  tools: [],
} as unknown as FlatMcpServer;

const step: WorkflowAction = {
  id: 'step-1',
  name: 'Search docs',
  type: WorkflowActionType.MCP_TOOL,
  valid: true,
  settings: {
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
    input: {
      mcpServerId: MCP_SERVER_ID,
      toolName: 'search_docs',
      toolInput: { query: '{{trigger.query}}' },
    },
  },
};

const setup = (server: FlatMcpServer = mcpServer) => {
  const mcpServerClientService = { callTool: jest.fn() };
  const workflowExecutionContextService = {
    getExecutionContext: jest.fn().mockResolvedValue({
      authContext: {
        type: 'user',
        workspace: { id: WORKSPACE_ID },
        user: { id: 'user-id' },
        userWorkspaceId: 'user-workspace-id',
      },
      application: undefined,
    }),
    assertRunApplicationCanTriggerStepTargetOrThrow: jest.fn(),
  };
  const flatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
      flatMcpServerMaps: {
        byUniversalIdentifier: { [server.universalIdentifier]: server },
        universalIdentifierById: { [server.id]: server.universalIdentifier },
      },
    }),
  };
  const action = new McpToolWorkflowAction(
    mcpServerClientService as unknown as McpServerClientService,
    workflowExecutionContextService as unknown as WorkflowExecutionContextService,
    flatEntityMapsCacheService as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
  );
  const input = {
    currentStepId: step.id,
    steps: [step],
    context: { trigger: { query: 'invoices' } },
    runInfo: { workspaceId: WORKSPACE_ID, workflowRunId: 'run-id' },
  } as unknown as WorkflowActionInput;

  return { action, input, mcpServerClientService };
};

describe('McpToolWorkflowAction', () => {
  it('resolves variables and calls the tool as the run user', async () => {
    const { action, input, mcpServerClientService } = setup();

    mcpServerClientService.callTool.mockResolvedValue({
      content: [{ type: 'text', text: 'two results' }],
      structuredContent: { total: 2 },
    });

    const output = await action.execute(input);

    expect(mcpServerClientService.callTool).toHaveBeenCalledWith({
      target: expect.objectContaining({
        url: 'https://docs.example.com/mcp',
        userWorkspaceId: 'user-workspace-id',
      }),
      toolName: 'search_docs',
      toolArguments: { query: 'invoices' },
    });
    expect(output).toEqual({ result: { total: 2 } });
  });

  it('returns the server error text as the step error', async () => {
    const { action, input, mcpServerClientService } = setup();

    mcpServerClientService.callTool.mockResolvedValue({
      isError: true,
      content: [{ type: 'text', text: 'index unavailable' }],
    });

    expect(await action.execute(input)).toEqual({
      error: 'index unavailable',
    });
  });

  it('fails without calling an inactive server', async () => {
    const { action, input, mcpServerClientService } = setup({
      ...mcpServer,
      isActive: false,
    });

    expect(await action.execute(input)).toEqual({
      error: 'MCP server Docs is inactive',
    });
    expect(mcpServerClientService.callTool).not.toHaveBeenCalled();
  });
});
