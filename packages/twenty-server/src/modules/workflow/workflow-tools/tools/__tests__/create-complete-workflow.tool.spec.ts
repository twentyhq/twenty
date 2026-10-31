import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { createCreateCompleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/create-complete-workflow.tool';

const CORE_WORKFLOW_ID = 'b3b8a4f0-0000-4000-8000-000000000001';
const CORE_WORKFLOW_VERSION_ID = 'b3b8a4f0-0000-4000-8000-000000000002';
const WORKSPACE_WORKFLOW_ID = 'b3b8a4f0-0000-4000-8000-000000000003';
const STEP_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const trigger = {
  name: 'Manual Trigger',
  type: 'MANUAL',
  settings: { outputSchema: {} },
  nextStepIds: [],
};

const buildStep = ({
  type,
  input = {},
}: {
  type: string;
  input?: Record<string, unknown>;
}) => ({
  id: STEP_ID,
  name: 'Step',
  type,
  valid: true,
  nextStepIds: [],
  settings: { input, outputSchema: {} },
});

const edges = [{ source: 'trigger', target: STEP_ID }];

const buildTool = () => {
  const coreWorkflowMutationService = {
    createWorkflowWithContent: jest.fn().mockResolvedValue({
      coreWorkflow: {
        id: CORE_WORKFLOW_ID,
        workspaceWorkflowId: WORKSPACE_WORKFLOW_ID,
      },
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
    }),
  };
  const coreWorkflowLifecycleService = {
    activateCoreWorkflowVersion: jest.fn().mockResolvedValue(true),
  };
  const workflowAiAgentStepAgentService = {
    findAgentRunnableByNewStepOrThrow: jest.fn(),
  };
  const deps: Parameters<typeof createCreateCompleteWorkflowTool>[0] = {
    coreWorkflowMutationService,
    coreWorkflowLifecycleService,
    workflowAiAgentStepAgentService,
  };

  const tool = createCreateCompleteWorkflowTool(deps, {
    workspaceId: 'workspace-id',
    userWorkspaceId: 'user-workspace-id',
    rolePermissionConfig: { shouldBypassPermissionChecks: true },
  });

  return {
    tool,
    coreWorkflowMutationService,
    coreWorkflowLifecycleService,
    workflowAiAgentStepAgentService,
  };
};

type ToolInput = Parameters<
  ReturnType<typeof createCreateCompleteWorkflowTool>['execute']
>[0];

const buildInput = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    name: 'My workflow',
    trigger,
    steps: [buildStep({ type: 'SEND_EMAIL' })],
    edges,
    ...overrides,
  }) as unknown as ToolInput;

describe('createCreateCompleteWorkflowTool', () => {
  it('creates the workflow with its whole content in one server call', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    const result = await tool.execute(buildInput());

    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).toHaveBeenCalledTimes(1);
    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        userWorkspaceId: 'user-workspace-id',
        name: 'My workflow',
        trigger,
        steps: [buildStep({ type: 'SEND_EMAIL' })],
        edges,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        result: expect.objectContaining({
          coreWorkflowId: CORE_WORKFLOW_ID,
          coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
          stepIds: [STEP_ID],
        }),
        recordReferences: [
          expect.objectContaining({ recordId: WORKSPACE_WORKFLOW_ID }),
        ],
      }),
    );
  });

  it('reports that nothing was created when the creation fails', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    coreWorkflowMutationService.createWorkflowWithContent.mockRejectedValue(
      new Error("Target step 'unknown' not found"),
    );

    const result = await tool.execute(buildInput());

    expect(result).toEqual({
      success: false,
      error: "Target step 'unknown' not found",
      message: expect.stringContaining('nothing was created'),
    });
  });

  it('refuses CODE steps without creating anything', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    const result = await tool.execute(
      buildInput({ steps: [buildStep({ type: 'CODE' })] }),
    );

    expect(result.success).toBe(false);
    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).not.toHaveBeenCalled();
  });

  it('creates AI_AGENT steps, which need no agent', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    const result = await tool.execute(
      buildInput({ steps: [buildStep({ type: 'AI_AGENT' })] }),
    );

    expect(result.success).toBe(true);
    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).toHaveBeenCalled();
  });

  it("refuses an AI_AGENT step running another step's hidden agent", async () => {
    const {
      tool,
      coreWorkflowMutationService,
      workflowAiAgentStepAgentService,
    } = buildTool();

    workflowAiAgentStepAgentService.findAgentRunnableByNewStepOrThrow.mockRejectedValue(
      new WorkflowVersionStepException(
        'Agent "Hidden step agent" is archived or belongs to another workflow step',
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      ),
    );

    const result = await tool.execute(
      buildInput({
        steps: [
          buildStep({
            type: 'AI_AGENT',
            input: { agentId: 'hidden-agent-id' },
          }),
        ],
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('belongs to another workflow step'),
      }),
    );
    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).not.toHaveBeenCalled();
  });

  it('activates the created version when asked to', async () => {
    const { tool, coreWorkflowLifecycleService } = buildTool();

    const result = await tool.execute(buildInput({ activate: true }));

    expect(
      coreWorkflowLifecycleService.activateCoreWorkflowVersion,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
    });
    expect(result.success).toBe(true);
  });

  it('returns the created draft ids when the activation fails', async () => {
    const { tool, coreWorkflowLifecycleService } = buildTool();

    coreWorkflowLifecycleService.activateCoreWorkflowVersion.mockRejectedValue(
      new Error('The workflow has no steps.'),
    );

    const result = await tool.execute(buildInput({ activate: true }));

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Do not create it again'),
        result: expect.objectContaining({
          coreWorkflowId: CORE_WORKFLOW_ID,
          coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
        }),
      }),
    );
  });
});
