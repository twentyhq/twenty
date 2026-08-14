import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { type WorkflowIfElseResult } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/types/workflow-if-else-result.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// An if/else succeeds as a step but only one of its branches is live. Seen from
// a child on a branch that was not taken, the if/else reads as SKIPPED, so the
// regular parent-status rules skip that child without anything being forced.
export const getEffectiveParentStatus = ({
  parentStep,
  childStepId,
  stepInfos,
}: {
  parentStep: WorkflowAction;
  childStepId: string;
  stepInfos: WorkflowRunStepInfos;
}): StepStatus | undefined => {
  const parentStatus = stepInfos[parentStep.id]?.status;

  if (!isWorkflowIfElseAction(parentStep)) {
    return parentStatus;
  }

  const matchingBranchId = (
    stepInfos[parentStep.id]?.result as WorkflowIfElseResult | undefined
  )?.matchingBranchId;

  if (!isDefined(matchingBranchId)) {
    return parentStatus;
  }

  const matchingBranch = parentStep.settings.input.branches.find(
    (branch) => branch.id === matchingBranchId,
  );

  return matchingBranch?.nextStepIds?.includes(childStepId)
    ? parentStatus
    : StepStatus.SKIPPED;
};
