import { isDefined } from 'twenty-shared/utils';
import { getStepOutgoingStepIds } from 'twenty-shared/workflow';

import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowIfElseResult } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/types/workflow-if-else-result.type';
import {
  type WorkflowAction,
  type WorkflowIfElseAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const getReachableStepIds = ({
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

    if (isDefined(step)) {
      stepIdsToVisit.push(...getStepOutgoingStepIds(step));
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
    const stepIdsReachableFromMatchingBranch = getReachableStepIds({
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
