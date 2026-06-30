import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowIfElseResult } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/types/workflow-if-else-result.type';
import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getNextStepIdsForIfElse = ({
  executedStep,
  executedStepOutput,
}: {
  executedStep: WorkflowIfElseAction;
  executedStepOutput: WorkflowActionOutput;
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

    return {
      nextStepIdsToExecute: matchingBranch?.nextStepIds,
      nextStepIdsToSkip: nonMatchingBranches.flatMap(
        (branch) => branch.nextStepIds,
      ),
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
