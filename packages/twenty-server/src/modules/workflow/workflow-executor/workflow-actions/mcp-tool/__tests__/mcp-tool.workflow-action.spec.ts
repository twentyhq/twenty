import { Test } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { McpServerToolCallService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-call.service';
import { type McpServerToolInputSchema } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { McpToolWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/mcp-tool.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const WORKSPACE_ID = 'workspace-id';

const SEARCH_DOCS_INPUT_SCHEMA: McpServerToolInputSchema = { type: 'object' };

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
      inputSchema: SEARCH_DOCS_INPUT_SCHEMA,
      annotations: null,
    },
  ],
};

const buildInput = (toolName = 'search_docs'): WorkflowActionInput => {
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
        mcpServerId: MCP_SERVER.id,
        toolName,
        toolInput: {
          query: '{{trigger.query}}',
          limit: null,
          tags: [],
          note: '',
          filter: { status: null },
        },
      },
    },
  };

  return {
    currentStepId: step.id,
    steps: [step],
    context: { trigger: { query: 'invoices' } },
    runInfo: { workspaceId: WORKSPACE_ID, workflowRunId: 'run-id' },
  };
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
  const assertRunApplicationCanTriggerStepTargetOrThrow = jest.fn();

  const module = await Test.createTestingModule({
    providers: [
      McpToolWorkflowAction,
      { provide: McpServerToolCallService, useValue: { callTool } },
      {
        provide: WorkflowExecutionContextService,
        useValue: {
          getExecutionContext: jest.fn().mockResolvedValue({
            authContext: {
              type: 'user',
              workspace: { id: WORKSPACE_ID },
              user: { id: 'user-id' },
              userWorkspaceId: 'user-workspace-id',
            },
            application: { id: 'application-id', name: 'Docs app' },
          }),
          assertRunApplicationCanTriggerStepTargetOrThrow,
        },
      },
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

  return {
    action: module.get(McpToolWorkflowAction),
    callTool,
    assertRunApplicationCanTriggerStepTargetOrThrow,
  };
};

describe('McpToolWorkflowAction', () => {
  it('calls the tool as the run user, dropping only the untouched null inputs', async () => {
    const { action, callTool } = await setup();

    const output = await action.execute(buildInput());

    expect(callTool).toHaveBeenCalledTimes(1);
    expect(callTool).toHaveBeenCalledWith({
      mcpServer: MCP_SERVER,
      toolName: 'search_docs',
      toolArguments: { query: 'invoices', tags: [], note: '' },
      userWorkspaceId: 'user-workspace-id',
    });
    expect(output).toEqual({ result: { total: 2 } });
  });

  it('keeps an untouched nested object the tool schema requires', async () => {
    const { action, callTool } = await setup({
      ...MCP_SERVER,
      tools: [
        {
          ...MCP_SERVER.tools[0],
          inputSchema: { type: 'object', required: ['filter'] },
        },
      ],
    });

    await action.execute(buildInput());

    expect(callTool).toHaveBeenCalledWith(
      expect.objectContaining({
        toolArguments: { query: 'invoices', tags: [], note: '', filter: {} },
      }),
    );
  });

  it('refuses a tool input that does not resolve to an object', async () => {
    const { action, callTool } = await setup();
    const input = buildInput();
    const [step] = input.steps;

    if (step.type !== WorkflowActionType.MCP_TOOL) {
      throw new Error('Expected an MCP tool step');
    }

    step.settings.input.toolInput =
      '{{trigger.query}}' as unknown as typeof step.settings.input.toolInput;

    await expect(action.execute(input)).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      message: 'Tool input of search_docs must resolve to an object',
    });
    expect(callTool).not.toHaveBeenCalled();
  });

  it('returns the tool failure as the step error', async () => {
    const { action, callTool } = await setup();

    callTool.mockResolvedValue({
      output: {
        success: false,
        message: 'MCP tool search_docs failed',
        error: 'index unavailable',
      },
      isToolUnknownToServer: false,
    });

    expect(await action.execute(buildInput())).toEqual({
      error: 'index unavailable',
    });
  });

  it('refuses an inactive server without calling it', async () => {
    const { action, callTool } = await setup({
      ...MCP_SERVER,
      isActive: false,
    });

    await expect(action.execute(buildInput())).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      message: 'MCP server Docs is inactive',
    });
    expect(callTool).not.toHaveBeenCalled();
  });

  it('refuses a tool the server no longer offers', async () => {
    const { action, callTool } = await setup();

    await expect(
      action.execute(buildInput('delete_docs')),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      message: 'MCP server Docs no longer offers the tool delete_docs',
    });
    expect(callTool).not.toHaveBeenCalled();
  });

  it('does not call a server the run application cannot reach', async () => {
    const {
      action,
      callTool,
      assertRunApplicationCanTriggerStepTargetOrThrow,
    } = await setup();
    const forbidden = new WorkflowStepExecutorException(
      'MCP server "Docs" belongs to another application',
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );

    assertRunApplicationCanTriggerStepTargetOrThrow.mockImplementation(() => {
      throw forbidden;
    });

    await expect(action.execute(buildInput())).rejects.toBe(forbidden);
    expect(
      assertRunApplicationCanTriggerStepTargetOrThrow,
    ).toHaveBeenCalledTimes(1);
    expect(
      assertRunApplicationCanTriggerStepTargetOrThrow,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ targetApplicationId: 'application-id' }),
    );
    expect(callTool).not.toHaveBeenCalled();
  });
});
