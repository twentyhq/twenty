import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getNextStepIdsForIfElse = ({
  executedStep,
}: {
  executedStep: WorkflowIfElseAction;
}): { nextStepIdsToExecute: string[] } => ({
  nextStepIdsToExecute: [
    ...new Set(
      executedStep.settings.input.branches.flatMap(
        (branch) => branch.nextStepIds,
      ),
    ),
  ],
});
