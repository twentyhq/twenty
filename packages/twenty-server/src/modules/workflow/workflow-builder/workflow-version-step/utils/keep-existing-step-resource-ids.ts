import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Each version owns the logic function and agent of its steps, so an update can't point a step at another version's
export const keepExistingStepResourceIds = ({
  existingStep,
  step,
}: {
  existingStep: WorkflowAction;
  step: WorkflowAction;
}): WorkflowAction => {
  if (
    existingStep.type === WorkflowActionType.CODE &&
    step.type === WorkflowActionType.CODE
  ) {
    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          logicFunctionId: existingStep.settings.input.logicFunctionId,
        },
      },
    };
  }

  if (
    existingStep.type === WorkflowActionType.AI_AGENT &&
    step.type === WorkflowActionType.AI_AGENT
  ) {
    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          agentId: existingStep.settings.input.agentId,
        },
      },
    };
  }

  return step;
};
