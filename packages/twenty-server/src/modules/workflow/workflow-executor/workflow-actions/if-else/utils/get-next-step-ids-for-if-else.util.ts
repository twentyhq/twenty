import { isDefined } from 'twenty-shared/utils';

import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowIfElseResult } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/types/workflow-if-else-result.type';
import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import {
  type WorkflowAction,
  type WorkflowIfElseAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Only follows edges that are guaranteed to fire once their step succeeds
// (nextStepIds). Branch and iterator loop edges depend on runtime state:
// treating a maybe-live path as live would leave its target out of the skip
// set, and status-based evaluation would later run it even when no taken
// path leads to it.
const getGuaranteedReachableStepIds = ({
  fromStepIds,
  steps,
}: {
  fromStepIds: string[];
  steps: WorkflowAction[];
}): Set<string> => {
  const stepsById = new Map(steps.map((step) => [step.id, step]));

  const reachableStepIds = new Set<string>();
  const stepIdsToVisit = [...fromStepIds];

  while (stepIdsToVisit.length > 0) {
    const stepId = stepIdsToVisit.pop();

    if (!isDefined(stepId) || reachableStepIds.has(stepId)) {
      continue;
    }

    reachableStepIds.add(stepId);

    const step = stepsById.get(stepId);

    if (isDefined(step) && !isWorkflowIfElseAction(step)) {
      stepIdsToVisit.push(...(step.nextStepIds ?? []));
    }
  }

  return reachableStepIds;
};

export const getNextStepIdsForIfElse = ({
  executedStep,
  executedStepOutput,
  steps,
}: {
  executedStep: WorkflowIfElseAction;
  executedStepOutput: WorkflowActionOutput;
  steps: WorkflowAction[];
}): {
  nextStepIdsToExecute?: string[];
  nextStepIdsToSkip?: string[];
  nextStepIdsToFailSafely?: string[];
} => {
  const ifElseResult = executedStepOutput.result as
    | WorkflowIfElseResult
    | undefined;

  const branches = executedStep.settings.input.branches;

  if (ifElseResult?.matchingBranchId) {
    const matchingBranch = branches.find(
      (branch) => branch.id === ifElseResult.matchingBranchId,
    );

    const nonMatchingBranches = branches.filter(
      (branch) => branch.id !== ifElseResult.matchingBranchId,
    );

    // A step can be the direct target of a non-matching branch and also be
    // reached further down the matching branch. Such convergence steps must
    // not be skipped, otherwise the matching branch stops there.
    const stepIdsReachableFromMatchingBranch = getGuaranteedReachableStepIds({
      fromStepIds: matchingBranch?.nextStepIds ?? [],
      steps,
    });

    return {
      nextStepIdsToExecute: matchingBranch?.nextStepIds,
      nextStepIdsToSkip: nonMatchingBranches
        .flatMap((branch) => branch.nextStepIds)
        .filter((stepId) => !stepIdsReachableFromMatchingBranch.has(stepId)),
    };
  }

  if (executedStepOutput.shouldFailSafely) {
    return {
      nextStepIdsToFailSafely: branches.flatMap((branch) => branch.nextStepIds),
    };
  }

  return {
    nextStepIdsToSkip: branches.flatMap((branch) => branch.nextStepIds),
  };
};
