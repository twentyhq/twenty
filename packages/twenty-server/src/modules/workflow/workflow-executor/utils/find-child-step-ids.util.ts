import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const findChildStepIds = ({
  step,
}: {
  step: WorkflowAction;
}): string[] => {
  const childStepIds = [...(step.nextStepIds ?? [])];

  if (isWorkflowIfElseAction(step)) {
    for (const branch of step.settings.input.branches) {
      childStepIds.push(...(branch.nextStepIds ?? []));
    }
  }

  return [...new Set(childStepIds)];
};
