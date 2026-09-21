import { isDefined } from 'twenty-shared/utils';

import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { getIteratorInitialLoopStepIds } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-iterator-initial-loop-step-ids.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const findParentSteps = ({
  step,
  steps,
}: {
  step: WorkflowAction;
  steps: WorkflowAction[];
}): WorkflowAction[] => {
  return steps.filter((candidateParent) => {
    if (!isDefined(candidateParent)) {
      return false;
    }

    if (
      isWorkflowIteratorAction(candidateParent) &&
      getIteratorInitialLoopStepIds(candidateParent).includes(step.id)
    ) {
      return false;
    }

    if (candidateParent.nextStepIds?.includes(step.id)) {
      return true;
    }

    if (isWorkflowIfElseAction(candidateParent)) {
      return candidateParent.settings.input.branches.some((branch) =>
        branch.nextStepIds?.includes(step.id),
      );
    }

    return false;
  });
};
