import { createUpdateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-step.tool';

const CORE_WORKFLOW_VERSION_ID = 'b3b8a4f0-0000-4000-8000-000000000000';

const mockStep = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  name: 'Send email',
  type: 'SEND_EMAIL',
  valid: true,
  settings: { input: {} },
};

const buildTool = () => {
  const coreWorkflowVersionMutationService = {
    updateStep: jest.fn().mockResolvedValue(mockStep),
  };

  const tool = createUpdateWorkflowVersionStepTool(
    { coreWorkflowVersionMutationService } as never,
    {
      workspaceId: 'workspace-id',
      rolePermissionConfig: { shouldBypassPermissionChecks: true },
    },
  );

  return { tool, coreWorkflowVersionMutationService };
};

const baseInput = {
  coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
  step: mockStep,
} as unknown as Parameters<
  ReturnType<typeof createUpdateWorkflowVersionStepTool>['execute']
>[0];

describe('createUpdateWorkflowVersionStepTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the step on the core version and returns the result', async () => {
    const { tool, coreWorkflowVersionMutationService } = buildTool();

    const result = await tool.execute(baseInput);

    expect(coreWorkflowVersionMutationService.updateStep).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
      step: mockStep,
    });
    expect(result).toEqual(mockStep);
  });

  it('returns a failure when the update throws', async () => {
    const { tool, coreWorkflowVersionMutationService } = buildTool();

    coreWorkflowVersionMutationService.updateStep.mockRejectedValue(
      new Error('boom'),
    );

    const result = (await tool.execute(baseInput)) as Record<string, unknown>;

    expect(result.success).toBe(false);
    expect(result.error).toBe('boom');
  });
});
