import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

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
  nextStepIdsToExecute: [
    ...new Set(
      executedStep.settings.input.branches.flatMap(
        (branch) => branch.nextStepIds,
      ),
    ),
  ],
});
