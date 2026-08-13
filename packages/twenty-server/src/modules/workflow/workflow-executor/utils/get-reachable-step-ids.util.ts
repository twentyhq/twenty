import { isDefined } from 'twenty-shared/utils';

import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getReachableStepIds = ({
  fromStepIds,
  steps,
}: {
  fromStepIds: string[];
  steps: WorkflowAction[];
}): Set<string> => {
  const reachableStepIds = new Set<string>();
  const stepIdsToVisit = [...fromStepIds];

  while (stepIdsToVisit.length > 0) {
    const stepId = stepIdsToVisit.pop();

    if (!isDefined(stepId) || reachableStepIds.has(stepId)) {
      continue;
    }

    reachableStepIds.add(stepId);

    const step = steps.find((candidateStep) => candidateStep.id === stepId);

    if (!isDefined(step)) {
      continue;
    }

    stepIdsToVisit.push(...(step.nextStepIds ?? []));

    if (isWorkflowIfElseAction(step)) {
      for (const branch of step.settings.input.branches) {
        stepIdsToVisit.push(...(branch.nextStepIds ?? []));
      }
    }

    if (isWorkflowIteratorAction(step)) {
      stepIdsToVisit.push(...(step.settings.input.initialLoopStepIds ?? []));
    }
  }

  return reachableStepIds;
};
