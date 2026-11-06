import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  createMockCodeStep,
  createMockIfElseStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { createCreateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-step.tool';

const CORE_WORKFLOW_VERSION_ID = 'b3b8a4f0-0000-4000-8000-000000000000';

const buildTool = (steps: WorkflowAction[]) => {
  const coreWorkflowVersionWriteService = {
    getValidatedDraftCoreWorkflowVersion: jest
      .fn()
      .mockResolvedValue({ steps }),
  };
  const coreWorkflowVersionMutationService = {
    createStep: jest.fn().mockResolvedValue({}),
    autoLayoutCoreWorkflowVersion: jest.fn().mockResolvedValue(undefined),
  };

  const tool = createCreateWorkflowVersionStepTool(
    {
      coreWorkflowVersionWriteService,
      coreWorkflowVersionMutationService,
    } as never,
    {
      workspaceId: 'workspace-id',
      authContext: {
        type: 'user',
        workspace: { id: 'workspace-id' },
      } as WorkspaceAuthContext,
    },
  );

  return { tool, coreWorkflowVersionMutationService };
};

const createCodeStepWithoutParent = {
  coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
  stepType: WorkflowActionType.CODE,
};

describe('createCreateWorkflowVersionStepTool', () => {
  it('appends after the only step the workflow ends on', async () => {
    const { tool, coreWorkflowVersionMutationService } = buildTool([
      createMockCodeStep('last-step'),
    ]);

    await tool.execute(createCodeStepWithoutParent);

    expect(coreWorkflowVersionMutationService.createStep).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ parentStepId: 'last-step' }),
      }),
    );
  });

  it('asks for a branch instead of leaving the step unconnected when the workflow ends on an If/Else', async () => {
    const { tool, coreWorkflowVersionMutationService } = buildTool([
      createMockIfElseStep('if-else-step', [
        { id: 'branch-id', nextStepIds: [] },
      ]),
    ]);

    const result = await tool.execute(createCodeStepWithoutParent);

    expect(result).toMatchObject({ success: false });
    expect(
      coreWorkflowVersionMutationService.createStep,
    ).not.toHaveBeenCalled();
  });
});
