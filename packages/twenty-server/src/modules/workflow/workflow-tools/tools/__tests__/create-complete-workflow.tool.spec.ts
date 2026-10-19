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

const buildStep = (type: string) => ({
  id: STEP_ID,
  name: 'Step',
  type,
  valid: true,
  nextStepIds: [],
  settings: { input: {}, outputSchema: {} },
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

  const tool = createCreateCompleteWorkflowTool(
    { coreWorkflowMutationService, coreWorkflowLifecycleService } as never,
    {
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      rolePermissionConfig: { shouldBypassPermissionChecks: true },
    },
  );

  return { tool, coreWorkflowMutationService, coreWorkflowLifecycleService };
};

type ToolInput = Parameters<
  ReturnType<typeof createCreateCompleteWorkflowTool>['execute']
>[0];

const buildInput = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    name: 'My workflow',
    trigger,
    steps: [buildStep('SEND_EMAIL')],
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
        steps: [buildStep('SEND_EMAIL')],
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

  it.each(['CODE', 'AI_AGENT'])(
    'refuses %s steps without creating anything',
    async (stepType) => {
      const { tool, coreWorkflowMutationService } = buildTool();

      const result = await tool.execute(
        buildInput({ steps: [buildStep(stepType)] }),
      );

      expect(result.success).toBe(false);
      expect(
        coreWorkflowMutationService.createWorkflowWithContent,
      ).not.toHaveBeenCalled();
    },
  );

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
