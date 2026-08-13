import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { getReachableStepIds } from 'src/modules/workflow/workflow-executor/utils/get-reachable-step-ids.util';
import { type WorkflowIfElseResult } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/types/workflow-if-else-result.type';
import {
  type WorkflowAction,
  type WorkflowIfElseAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

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
