import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isIfElseBranchTarget = ({
  ifElseStep,
  stepId,
}: {
  ifElseStep: WorkflowIfElseAction;
  stepId: string;
}): boolean =>
  ifElseStep.settings.input.branches.some((branch) =>
    branch.nextStepIds?.includes(stepId),
  );
