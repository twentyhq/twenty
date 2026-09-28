import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const findChildStepIds = ({
  step,
}: {
  step: WorkflowAction;
}): string[] => {
  if (isWorkflowIfElseAction(step)) {
    return [
      ...new Set(
        step.settings.input.branches.flatMap(
          (branch) => branch.nextStepIds ?? [],
        ),
      ),
    ];
  }

  return [...new Set(step.nextStepIds ?? [])];
};
