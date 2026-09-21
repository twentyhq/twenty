import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getNextStepIdsForStepTypeChange = ({
  existingStep,
  builtStep,
}: {
  existingStep: WorkflowAction;
  builtStep: WorkflowAction;
}): string[] | undefined => {
  if (isWorkflowIfElseAction(builtStep)) {
    return [];
  }

  return existingStep.nextStepIds;
};
