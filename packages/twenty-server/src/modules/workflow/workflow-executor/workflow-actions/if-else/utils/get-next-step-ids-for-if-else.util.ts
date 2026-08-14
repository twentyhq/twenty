import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Every branch root is evaluated; a root on a branch that was not taken sees
// the if/else as SKIPPED (getEffectiveParentStatus) and skips itself, so the
// branch cut needs no forced statuses.
export const getNextStepIdsForIfElse = ({
  executedStep,
}: {
  executedStep: WorkflowIfElseAction;
  executedStepOutput: WorkflowActionOutput;
}): {
  nextStepIdsToExecute?: string[];
  nextStepIdsToSkip?: string[];
  nextStepIdsToFailSafely?: string[];
} => ({
  nextStepIdsToExecute: executedStep.settings.input.branches.flatMap(
    (branch) => branch.nextStepIds,
  ),
});
