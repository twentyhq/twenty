import { createUpdateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-step.tool';

const mockStep = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  name: 'Send email',
  type: 'SEND_EMAIL',
  valid: true,
  settings: { input: {} },
};

const buildTool = () => {
  const workflowVersionStepService = {
    updateWorkflowVersionStep: jest.fn().mockResolvedValue(mockStep),
  };

  const tool = createUpdateWorkflowVersionStepTool(
    { workflowVersionStepService } as never,
    { workspaceId: 'workspace-id' },
  );

  return { tool, workflowVersionStepService };
};

const baseInput = {
  workflowVersionId: 'b3b8a4f0-0000-4000-8000-000000000000',
  step: mockStep,
} as unknown as Parameters<
  ReturnType<typeof createUpdateWorkflowVersionStepTool>['execute']
>[0];

describe('createUpdateWorkflowVersionStepTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the step and returns the result', async () => {
    const { tool, workflowVersionStepService } = buildTool();

    const result = await tool.execute(baseInput);

    expect(workflowVersionStepService.updateWorkflowVersionStep).toHaveBeenCalled();
    expect(result).toEqual(mockStep);
  });

  it('returns a failure when the update throws', async () => {
    const { tool, workflowVersionStepService } = buildTool();

    workflowVersionStepService.updateWorkflowVersionStep.mockRejectedValue(
      new Error('boom'),
    );

    const result = (await tool.execute(baseInput)) as Record<string, unknown>;

    expect(result.success).toBe(false);
    expect(result.error).toBe('boom');
  });
});
