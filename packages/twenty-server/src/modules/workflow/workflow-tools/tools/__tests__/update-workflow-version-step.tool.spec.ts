import { ToolCategory } from 'twenty-shared/ai';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { createMockCodeStep } from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { createUpdateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-step.tool';

const CORE_WORKFLOW_VERSION_ID = 'b3b8a4f0-0000-4000-8000-000000000000';
const AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: 'workspace-id' },
} as WorkspaceAuthContext;

const mockStep = createMockCodeStep('f47ac10b-58cc-4372-a567-0e02b2c3d479');

const buildTool = () => {
  const coreWorkflowVersionMutationService = {
    updateStep: jest.fn().mockResolvedValue(mockStep),
  };

  const tool = createUpdateWorkflowVersionStepTool(
    { coreWorkflowVersionMutationService } as never,
    {
      workspaceId: 'workspace-id',
      authContext: AUTH_CONTEXT,
    },
  );

  return { tool, coreWorkflowVersionMutationService };
};

const baseInput = {
  coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
  step: mockStep,
};

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

  describe('called by the AI through its tool set', () => {
    const upsertRecordStepWithFieldsToUpdate = ({
      fieldsToUpdate,
    }: {
      fieldsToUpdate: string[];
    }) => ({
      id: 'a1b2c3d4-0000-4000-8000-000000000001',
      name: 'Create or update company',
      type: 'UPSERT_RECORD',
      valid: true,
      settings: {
        input: {
          objectName: 'company',
          objectRecord: { name: 'Acme', domainName: 'acme.com' },
          fieldsToUpdate,
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
    });

    const callThroughToolSet = ({ step }: { step: object }) => {
      const { tool, coreWorkflowVersionMutationService } = buildTool();

      return {
        coreWorkflowVersionMutationService,
        output: executeToolFromToolSet(
          Object.fromEntries([[tool.name, tool]]),
          tool.name,
          { coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID, step },
          ToolCategory.WORKFLOW,
        ),
      };
    };

    it('refuses fieldsToUpdate on an upsert record step, which writes its whole objectRecord', async () => {
      const { coreWorkflowVersionMutationService, output } = callThroughToolSet(
        {
          step: upsertRecordStepWithFieldsToUpdate({
            fieldsToUpdate: ['name'],
          }),
        },
      );

      expect(await output).toMatchObject({
        success: false,
        error: expect.stringContaining('Unrecognized key: "fieldsToUpdate"'),
      });
      expect(
        coreWorkflowVersionMutationService.updateStep,
      ).not.toHaveBeenCalled();
    });
  });
});
