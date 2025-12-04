import { v4 as uuidv4 } from 'uuid';

import { type WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';

export type WorkflowStepToolsDeps = {
  workflowVersionStepService: {
    createWorkflowVersionStep: (args: {
      workspaceId: string;
      input: {
        workflowVersionId: string;
        stepType: WorkflowActionType;
        parentStepId?: string;
        id?: string;
      };
    }) => Promise<unknown>;
    updateWorkflowVersionStep: (args: {
      workspaceId: string;
      workflowVersionId: string;
      step: unknown;
    }) => Promise<unknown>;
  };
};

export async function createAndConfigureStep(
  deps: WorkflowStepToolsDeps,
  workspaceId: string,
  workflowVersionId: string,
  stepType: WorkflowActionType,
  parentStepId: string | undefined,
  stepConfig: object,
) {
  const stepId = uuidv4();

  await deps.workflowVersionStepService.createWorkflowVersionStep({
    workspaceId,
    input: {
      workflowVersionId,
      stepType,
      parentStepId,
      id: stepId,
    },
  });

  const result =
    await deps.workflowVersionStepService.updateWorkflowVersionStep({
      workspaceId,
      workflowVersionId,
      step: { id: stepId, ...stepConfig },
    });

  return { stepId, result };
}
