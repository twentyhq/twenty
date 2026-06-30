import { createUpdateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-step.tool';

const mockStep = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  name: 'Send email',
  type: 'SEND_EMAIL',
  valid: true,
  settings: { input: {} },
};

const buildTool = ({
  validationResult = { valid: true, errors: [], warnings: [] },
}: {
  validationResult?: object;
} = {}) => {
  const workflowVersionStepService = {
    updateWorkflowVersionStep: jest.fn().mockResolvedValue(mockStep),
  };
  const workflowValidationService = {
    validateWorkflowVersion: jest.fn().mockResolvedValue(validationResult),
  };

  const tool = createUpdateWorkflowVersionStepTool(
    {
      workflowVersionStepService,
      workflowValidationService,
    } as never,
    { workspaceId: 'workspace-id' },
  );

  return { tool, workflowVersionStepService, workflowValidationService };
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

  it('should validate by default and return a compact summary', async () => {
    const { tool, workflowValidationService } = buildTool({
      validationResult: {
        valid: false,
        errors: [
          {
            severity: 'error',
            code: 'DANGLING_REFERENCE',
            message: 'Unknown variable',
            availablePaths: ['{{trigger.x}}'],
          },
        ],
        warnings: [{ severity: 'warning', code: 'NO_STEPS', message: 'w' }],
      },
    });

    const result = (await tool.execute(baseInput)) as Record<string, unknown>;

    expect(
      workflowValidationService.validateWorkflowVersion,
    ).toHaveBeenCalled();

    const validation = result.validation as Record<string, unknown>;

    expect(validation.valid).toBe(false);
    expect(validation.errorCount).toBe(1);
    expect(validation.warningCount).toBe(1);
    expect(validation).not.toHaveProperty('warnings');
    expect((validation.errors as object[])[0]).not.toHaveProperty(
      'availablePaths',
    );
  });

  it('should skip validation entirely when validate is false', async () => {
    const { tool, workflowValidationService } = buildTool();

    const result = (await tool.execute({
      ...baseInput,
      validate: false,
    })) as Record<string, unknown>;

    expect(
      workflowValidationService.validateWorkflowVersion,
    ).not.toHaveBeenCalled();
    expect(result).not.toHaveProperty('validation');
  });

  it('should still return the step result when validation throws', async () => {
    const { tool, workflowValidationService } = buildTool();

    workflowValidationService.validateWorkflowVersion.mockRejectedValue(
      new Error('boom'),
    );

    const result = (await tool.execute(baseInput)) as Record<string, unknown>;

    expect(result.validationError).toBe('boom');
    expect(result).not.toHaveProperty('validation');
  });
});
